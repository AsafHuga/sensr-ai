export type InterviewerType = "hiring_manager" | "senior_pm" | "recruiter";

export type Verdict = "strong_pass" | "pass" | "borderline" | "fail" | "strong_fail";

export type FinalDecision = "PASS" | "BORDERLINE" | "FAIL";

export interface DimensionScore {
  dimension: string;
  score: number; // 1-5
  rationale: string;
}

export interface InterviewerVerdict {
  interviewer: InterviewerType;
  interviewerName: string;
  verdict: Verdict;
  confidence: number; // 0-100
  scores: DimensionScore[];
  strengths: string[];
  redFlags: string[];
  rawFeedback: string;
}

export interface Disagreement {
  topic: string;
  positions: {
    interviewer: string;
    stance: string;
  }[];
}

export interface ScoreBreakdown {
  dimension: string;
  score: number;
  weight: number;
}

export interface JuryVerdict {
  finalDecision: FinalDecision;
  overallScore: number; // 1-100
  breakdown: ScoreBreakdown[];
  strengths: string[];
  redFlags: string[];
  disagreements: Disagreement[];
  interviewerVerdicts: InterviewerVerdict[];
}

export interface EvaluationRequest {
  question: string;
  answer: string;
}

export interface InterviewerConfig {
  type: InterviewerType;
  name: string;
  title: string;
  systemPrompt: string;
  dimensions: string[];
}
