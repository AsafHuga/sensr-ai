import { NextRequest, NextResponse } from "next/server";
import { evaluateWithInterviewer } from "@/lib/anthropic";
import { aggregateVerdicts } from "@/lib/interviewers/aggregator";
import { hiringManagerConfig } from "@/lib/interviewers/hiring-manager";
import { seniorPMConfig } from "@/lib/interviewers/senior-pm";
import { recruiterConfig } from "@/lib/interviewers/recruiter";
import { EvaluationRequest, JuryVerdict } from "@/lib/interviewers/types";

export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Run all three interviewers in parallel
    const interviewers = [hiringManagerConfig, seniorPMConfig, recruiterConfig];

    const verdictPromises = interviewers.map((config) =>
      evaluateWithInterviewer(config, question, answer)
    );

    const verdicts = await Promise.all(verdictPromises);

    // Aggregate the verdicts
    const juryVerdict: JuryVerdict = aggregateVerdicts(verdicts);

    return NextResponse.json(juryVerdict);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate response" },
      { status: 500 }
    );
  }
}
