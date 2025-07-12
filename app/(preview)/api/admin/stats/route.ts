
import { getUserStats } from "@/lib/actions/users";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await getUserStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
