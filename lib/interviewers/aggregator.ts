import {
  InterviewerVerdict,
  JuryVerdict,
  FinalDecision,
  Verdict,
  Disagreement,
  ScoreBreakdown,
} from "./types";

const VERDICT_SCORES: Record<Verdict, number> = {
  strong_pass: 5,
  pass: 4,
  borderline: 3,
  fail: 2,
  strong_fail: 1,
};

export function aggregateVerdicts(verdicts: InterviewerVerdict[]): JuryVerdict {
  const finalDecision = calculateFinalDecision(verdicts);
  const overallScore = calculateOverallScore(verdicts);
  const breakdown = calculateBreakdown(verdicts);
  const strengths = findAgreedStrengths(verdicts);
  const redFlags = collectAllRedFlags(verdicts);
  const disagreements = findDisagreements(verdicts);

  return {
    finalDecision,
    overallScore,
    breakdown,
    strengths,
    redFlags,
    disagreements,
    interviewerVerdicts: verdicts,
  };
}

function calculateFinalDecision(verdicts: InterviewerVerdict[]): FinalDecision {
  const verdictCounts = {
    strong_pass: 0,
    pass: 0,
    borderline: 0,
    fail: 0,
    strong_fail: 0,
  };

  for (const v of verdicts) {
    verdictCounts[v.verdict]++;
  }

  // Any strong_fail = FAIL
  if (verdictCounts.strong_fail > 0) {
    return "FAIL";
  }

  // 2+ fails = FAIL
  if (verdictCounts.fail >= 2) {
    return "FAIL";
  }

  // All pass or strong_pass = PASS
  if (verdictCounts.pass + verdictCounts.strong_pass === verdicts.length) {
    return "PASS";
  }

  // 2 pass + 1 borderline = PASS
  if (verdictCounts.pass + verdictCounts.strong_pass >= 2 && verdictCounts.borderline <= 1) {
    return "PASS";
  }

  // 2+ borderline = BORDERLINE
  if (verdictCounts.borderline >= 2) {
    return "BORDERLINE";
  }

  // Mixed bag = BORDERLINE
  return "BORDERLINE";
}

function calculateOverallScore(verdicts: InterviewerVerdict[]): number {
  // Calculate weighted average of all dimension scores
  let totalScore = 0;
  let totalDimensions = 0;

  for (const verdict of verdicts) {
    for (const score of verdict.scores) {
      totalScore += score.score;
      totalDimensions++;
    }
  }

  if (totalDimensions === 0) return 50;

  // Convert 1-5 scale to 1-100
  const averageScore = totalScore / totalDimensions;
  return Math.round((averageScore / 5) * 100);
}

function calculateBreakdown(verdicts: InterviewerVerdict[]): ScoreBreakdown[] {
  const dimensionScores: Record<string, { total: number; count: number }> = {};

  for (const verdict of verdicts) {
    for (const score of verdict.scores) {
      if (!dimensionScores[score.dimension]) {
        dimensionScores[score.dimension] = { total: 0, count: 0 };
      }
      dimensionScores[score.dimension].total += score.score;
      dimensionScores[score.dimension].count++;
    }
  }

  return Object.entries(dimensionScores).map(([dimension, { total, count }]) => ({
    dimension,
    score: Math.round((total / count) * 20), // Convert to 0-100
    weight: 1 / Object.keys(dimensionScores).length,
  }));
}

function findAgreedStrengths(verdicts: InterviewerVerdict[]): string[] {
  // Find strengths mentioned by 2+ interviewers (or similar concepts)
  const strengthCounts: Record<string, number> = {};

  for (const verdict of verdicts) {
    for (const strength of verdict.strengths) {
      const normalized = strength.toLowerCase();
      strengthCounts[normalized] = (strengthCounts[normalized] || 0) + 1;
    }
  }

  // Return strengths mentioned by 2+ interviewers
  const agreedStrengths = Object.entries(strengthCounts)
    .filter(([, count]) => count >= 2)
    .map(([strength]) => strength);

  // If no agreement, return top strengths from each
  if (agreedStrengths.length === 0) {
    return verdicts.flatMap((v) => v.strengths.slice(0, 1));
  }

  return agreedStrengths;
}

function collectAllRedFlags(verdicts: InterviewerVerdict[]): string[] {
  // Any red flag from any interviewer is important
  const allFlags = new Set<string>();

  for (const verdict of verdicts) {
    for (const flag of verdict.redFlags) {
      allFlags.add(flag);
    }
  }

  return Array.from(allFlags);
}

function findDisagreements(verdicts: InterviewerVerdict[]): Disagreement[] {
  const disagreements: Disagreement[] = [];

  // Check if verdicts are significantly different
  const verdictScores = verdicts.map((v) => ({
    interviewer: v.interviewerName,
    score: VERDICT_SCORES[v.verdict],
    verdict: v.verdict,
  }));

  const maxScore = Math.max(...verdictScores.map((v) => v.score));
  const minScore = Math.min(...verdictScores.map((v) => v.score));

  // If there's a 2+ point spread, there's disagreement
  if (maxScore - minScore >= 2) {
    disagreements.push({
      topic: "Overall Assessment",
      positions: verdictScores.map((v) => ({
        interviewer: v.interviewer,
        stance: `${v.verdict.replace("_", " ")} (${v.score}/5)`,
      })),
    });
  }

  return disagreements;
}
