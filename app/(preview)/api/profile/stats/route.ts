
import { NextRequest, NextResponse } from "next/server";
import { getUserById, getUserConversations } from "@/lib/actions/users";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema/users";
import { eq, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get conversation count
    const conversationCount = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.userId, userId));

    // Get user conversations for analysis
    const userConversations = await getUserConversations(userId, 100);

    // Calculate stats
    const totalQuestions = conversationCount[0]?.count || 0;
    const totalLogins = Math.ceil(totalQuestions / 3); // Mock calculation
    const creditsUsed = user.totalTokensUsed;
    const lastLogin = new Date();
    const memberSince = user.createdAt;
    const averageSessionLength = totalQuestions > 0 ? `${Math.ceil(totalQuestions * 2.5)} min` : "0 min";
    
    // Mock favorite topics based on conversation analysis
    const favoriteTopics = ["Programming", "AI", "Web Development"];

    const stats = {
      totalQuestions,
      totalLogins,
      creditsUsed,
      lastLogin,
      memberSince,
      averageSessionLength,
      favoriteTopics
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Failed to fetch user statistics" }, { status: 500 });
  }
}
