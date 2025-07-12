
import { NextRequest, NextResponse } from "next/server";
import { getUserPointTransactions, awardPoints, spendPoints } from "@/lib/actions/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const transactions = await getUserPointTransactions(userId, limit);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching point transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, points, description, referenceId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (action === 'award') {
      await awardPoints(userId, points, description, 'manual', referenceId);
      return NextResponse.json({ success: true });
    } else if (action === 'spend') {
      await spendPoints(userId, points, description, referenceId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing points request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
