"use server";

import { db } from "@/lib/db";
import { users, conversations, referrals, pointTransactions, type NewUserParams, type NewConversationParams } from "@/lib/db/schema/users";
import { eq, desc, sql, and } from "drizzle-orm";
import { nanoid } from "@/lib/utils";

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function createUser(data: NewUserParams & { referredByCode?: string }) {
  try {
    const referralCode = generateReferralCode();
    let referredBy = null;

    // Check if user was referred
    if (data.referredByCode) {
      const [referrer] = await db.select().from(users).where(eq(users.referralCode, data.referredByCode));
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const [user] = await db.insert(users).values({
      id: nanoid(),
      ...data,
      referralCode,
      referredBy,
      points: 100, // Welcome bonus
    }).returning();

    // Award welcome points
    await awardPoints(user.id, 100, "Welcome bonus", "signup");

    // Process referral if applicable
    if (referredBy) {
      await processReferral(referredBy, user.id);
    }

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

export async function getUserStats() {
  try {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalTokens = await db.select({ total: sql<number>`sum(${users.totalTokensUsed})` }).from(users);
    const totalConversations = await db.select({ count: sql<number>`count(*)` }).from(conversations);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalTokens: totalTokens[0]?.total || 0,
      totalConversations: totalConversations[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      totalUsers: 0,
      totalTokens: 0,
      totalConversations: 0,
    };
  }
}

export async function logConversation(data: NewConversationParams) {
  try {
    const [conversation] = await db.insert(conversations).values({
      id: nanoid(),
      ...data,
    }).returning();

    // Update user's total tokens
    await db.update(users)
      .set({ 
        totalTokensUsed: sql`${users.totalTokensUsed} + ${data.tokensUsed}`,
        updatedAt: sql`now()`
      })
      .where(eq(users.id, data.userId));

    return conversation;
  } catch (error) {
    console.error("Error logging conversation:", error);
    throw new Error("Failed to log conversation");
  }
}

export async function getUserConversations(userId: string, limit = 50) {
  try {
    return await db.select().from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error getting user conversations:", error);
    return [];
  }
}

export async function updateUserTokens(userId: string, tokensUsed: number) {
  try {
    await db.update(users)
      .set({ 
        totalTokensUsed: sql`${users.totalTokensUsed} + ${tokensUsed}`,
        updatedAt: sql`now()`
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("Error updating user tokens:", error);
  }
}

export async function updateUserProfile(userId: string, profileData: {
  name?: string;
  avatar?: string;
  bio?: string;
  preferences?: string;
}) {
  try {
    const [user] = await db.update(users)
      .set({
        ...profileData,
        updatedAt: sql`now()`
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
}

export async function getUserById(userId: string) {
  try {
    if (!db) {
      throw new Error("Database not configured");
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}



// Referral and Points System Functions
export async function awardPoints(userId: string, points: number, description: string, type: string, referenceId?: string) {
  try {
    await db.transaction(async (tx) => {
      // Update user points
      await tx.update(users)
        .set({ 
          points: sql`${users.points} + ${points}`,
          updatedAt: sql`now()`
        })
        .where(eq(users.id, userId));

      // Log transaction
      await tx.insert(pointTransactions).values({
        id: nanoid(),
        userId,
        type,
        points,
        description,
        referenceId,
      });
    });
  } catch (error) {
    console.error("Error awarding points:", error);
    throw new Error("Failed to award points");
  }
}

export async function spendPoints(userId: string, points: number, description: string, referenceId?: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user || user.points < points) {
      throw new Error("Insufficient points");
    }

    await db.transaction(async (tx) => {
      // Update user points
      await tx.update(users)
        .set({ 
          points: sql`${users.points} - ${points}`,
          updatedAt: sql`now()`
        })
        .where(eq(users.id, userId));

      // Log transaction
      await tx.insert(pointTransactions).values({
        id: nanoid(),
        userId,
        type: "spent",
        points: -points,
        description,
        referenceId,
      });
    });
  } catch (error) {
    console.error("Error spending points:", error);
    throw new Error("Failed to spend points");
  }
}

export async function processReferral(referrerId: string, referredId: string) {
  try {
    const referralId = nanoid();
    const pointsAwarded = 50; // Points for successful referral

    await db.transaction(async (tx) => {
      // Create referral record
      await tx.insert(referrals).values({
        id: referralId,
        referrerId,
        referredId,
        status: "completed",
        pointsAwarded,
        completedAt: sql`now()`,
      });

      // Update referrer's total referrals count
      await tx.update(users)
        .set({ 
          totalReferrals: sql`${users.totalReferrals} + 1`,
          updatedAt: sql`now()`
        })
        .where(eq(users.id, referrerId));

      // Award points to referrer
      await tx.update(users)
        .set({ 
          points: sql`${users.points} + ${pointsAwarded}`,
          updatedAt: sql`now()`
        })
        .where(eq(users.id, referrerId));

      // Log points transaction
      await tx.insert(pointTransactions).values({
        id: nanoid(),
        userId: referrerId,
        type: "referral",
        points: pointsAwarded,
        description: "Referral bonus",
        referenceId: referralId,
      });
    });
  } catch (error) {
    console.error("Error processing referral:", error);
    throw new Error("Failed to process referral");
  }
}

export async function getUserReferrals(userId: string) {
  try {
    return await db.select({
      id: referrals.id,
      referredUser: {
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      },
      pointsAwarded: referrals.pointsAwarded,
      status: referrals.status,
      createdAt: referrals.createdAt,
      completedAt: referrals.completedAt,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredId, users.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));
  } catch (error) {
    console.error("Error getting user referrals:", error);
    return [];
  }
}

export async function getUserPointTransactions(userId: string, limit = 50) {
  try {
    return await db.select().from(pointTransactions)
      .where(eq(pointTransactions.userId, userId))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error getting point transactions:", error);
    return [];
  }
}

export async function validateReferralCode(code: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return !!user;
  } catch (error) {
    console.error("Error validating referral code:", error);
    return false;
  }
}

export async function getReferralStats(userId: string) {
  try {
    const totalReferrals = await db.select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.status, "completed")));

    const totalPointsEarned = await db.select({ total: sql<number>`sum(${pointTransactions.points})` })
      .from(pointTransactions)
      .where(and(eq(pointTransactions.userId, userId), eq(pointTransactions.type, "referral")));

    return {
      totalReferrals: totalReferrals[0]?.count || 0,
      totalPointsFromReferrals: totalPointsEarned[0]?.total || 0,
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return {
      totalReferrals: 0,
      totalPointsFromReferrals: 0,
    };
  }
}