import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FrameworkStep, frameworkSteps, getNextStep } from "@/lib/interview-flow";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface CoachRequest {
  question: string;
  currentStep: FrameworkStep;
  userResponse: string;
  conversationHistory: { role: "user" | "coach"; content: string }[];
}

interface CoachResponse {
  feedback: string;
  shouldProgress: boolean;
  nextStep: FrameworkStep;
  encouragement?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CoachRequest = await request.json();
    const { question, currentStep, userResponse, conversationHistory } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const stepConfig = frameworkSteps[currentStep];

    const systemPrompt = `You are a supportive PM interview coach helping a candidate practice answering product sense questions. Your role is to guide them through a structured framework.

CURRENT QUESTION: "${question}"

CURRENT FRAMEWORK STEP: ${stepConfig.title}
STEP OBJECTIVE: ${stepConfig.prompt}

YOUR COACHING STYLE:
- Be warm, encouraging, and supportive
- Give brief, actionable feedback (2-3 sentences max)
- If their answer is good enough, acknowledge it and move on
- If it needs improvement, ask ONE clarifying question
- Never be harsh or discouraging
- Sound like a helpful friend, not a strict evaluator

TIPS FOR THIS STEP:
${stepConfig.tips.map(t => `- ${t}`).join('\n')}

DECISION CRITERIA:
- If the user's response adequately addresses this step (even if not perfect), set shouldProgress: true
- If the response is too vague, off-topic, or missing key elements, set shouldProgress: false and ask a follow-up
- Be lenient - this is practice, not a test

Respond with JSON only:
{
  "feedback": "Your brief, encouraging feedback or follow-up question",
  "shouldProgress": true/false,
  "encouragement": "A short encouraging phrase (optional)"
}`;

    const messages = conversationHistory.map((msg) => ({
      role: msg.role === "coach" ? "assistant" : "user",
      content: msg.content,
    })) as { role: "user" | "assistant"; content: string }[];

    messages.push({
      role: "user",
      content: userResponse,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const shouldProgress = parsed.shouldProgress ?? false;
    const nextStep = shouldProgress ? getNextStep(currentStep) : currentStep;

    const coachResponse: CoachResponse = {
      feedback: parsed.feedback,
      shouldProgress,
      nextStep,
      encouragement: parsed.encouragement,
    };

    return NextResponse.json(coachResponse);
  } catch (error) {
    console.error("Coach error:", error);
    return NextResponse.json(
      { error: "Failed to get coach response" },
      { status: 500 }
    );
  }
}
