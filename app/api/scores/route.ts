import { NextRequest, NextResponse } from "next/server";
import { saveScore, calculatePercentile, getQuestionStats } from "@/lib/scores";

export async function POST(request: NextRequest) {
  try {
    const { questionId, score } = await request.json();

    if (!questionId || typeof score !== 'number') {
      return NextResponse.json(
        { error: "Missing questionId or score" },
        { status: 400 }
      );
    }

    // Save the score
    saveScore(questionId, score);

    // Calculate percentile
    const percentileData = calculatePercentile(questionId, score);

    // Get question stats
    const stats = getQuestionStats(questionId);

    return NextResponse.json({
      success: true,
      percentile: percentileData.percentile,
      rank: percentileData.rank,
      totalResponses: percentileData.totalResponses,
      stats,
    });
  } catch (error) {
    console.error("Scores API error:", error);
    return NextResponse.json(
      { error: "Failed to process score" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json(
        { error: "Missing questionId" },
        { status: 400 }
      );
    }

    const stats = getQuestionStats(questionId);

    return NextResponse.json({
      stats: stats || {
        totalResponses: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      },
    });
  } catch (error) {
    console.error("Scores API error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
