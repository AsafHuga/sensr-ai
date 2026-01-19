import Anthropic from "@anthropic-ai/sdk";
import { InterviewerConfig, InterviewerVerdict } from "./interviewers/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function evaluateWithInterviewer(
  config: InterviewerConfig,
  question: string,
  answer: string
): Promise<InterviewerVerdict> {
  const userPrompt = `
INTERVIEW QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

Please evaluate this answer from your perspective as ${config.name}, ${config.title}.
Remember to respond with ONLY a valid JSON object in the specified format.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: config.systemPrompt,
  });

  // Extract text content from response
  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON from response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    interviewer: config.type,
    interviewerName: config.name,
    verdict: parsed.verdict,
    confidence: parsed.confidence,
    scores: parsed.scores,
    strengths: parsed.strengths || [],
    redFlags: parsed.redFlags || [],
    rawFeedback: parsed.rawFeedback,
  };
}
