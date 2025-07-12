
import { NextRequest, NextResponse } from "next/server";
import { getUserReferrals, getReferralStats, validateReferralCode } from "@/lib/actions/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (action === 'stats') {
      const stats = await getReferralStats(userId);
      return NextResponse.json(stats);
    } else {
      const referrals = await getUserReferrals(userId);
      return NextResponse.json(referrals);
    }
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, referralCode } = body;

    if (action === 'validate') {
      const isValid = await validateReferralCode(referralCode);
      return NextResponse.json({ valid: isValid });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing referral request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
