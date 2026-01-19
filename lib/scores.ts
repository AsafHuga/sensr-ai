import fs from 'fs';
import path from 'path';

export interface ScoreEntry {
  questionId: string;
  score: number;
  timestamp: number;
}

const SCORES_FILE = path.join(process.cwd(), 'data', 'scores.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load all scores
export function loadScores(): ScoreEntry[] {
  ensureDataDir();
  try {
    if (fs.existsSync(SCORES_FILE)) {
      const data = fs.readFileSync(SCORES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading scores:', e);
  }
  return [];
}

// Save a new score
export function saveScore(questionId: string, score: number): void {
  const scores = loadScores();
  scores.push({
    questionId,
    score,
    timestamp: Date.now(),
  });

  ensureDataDir();
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

// Get scores for a specific question
export function getScoresForQuestion(questionId: string): number[] {
  const scores = loadScores();
  return scores
    .filter(s => s.questionId === questionId)
    .map(s => s.score);
}

// Calculate percentile for a score
export function calculatePercentile(questionId: string, score: number): {
  percentile: number;
  totalResponses: number;
  rank: number;
} {
  const questionScores = getScoresForQuestion(questionId);

  if (questionScores.length === 0) {
    return {
      percentile: 100, // First response is top 100%
      totalResponses: 1,
      rank: 1,
    };
  }

  // Count how many scores are below this one
  const scoresBelow = questionScores.filter(s => s < score).length;
  const scoresEqual = questionScores.filter(s => s === score).length;

  // Percentile = percentage of scores that are below or equal
  // Higher percentile = better (top 10% means you beat 90% of people)
  const percentile = Math.round(((scoresBelow + scoresEqual * 0.5) / questionScores.length) * 100);

  // Rank (1 = best)
  const sortedScores = [...questionScores, score].sort((a, b) => b - a);
  const rank = sortedScores.indexOf(score) + 1;

  return {
    percentile: Math.min(99, Math.max(1, 100 - percentile + 1)), // Convert to "top X%"
    totalResponses: questionScores.length + 1,
    rank,
  };
}

// Get statistics for a question
export function getQuestionStats(questionId: string): {
  totalResponses: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
} | null {
  const scores = getScoresForQuestion(questionId);

  if (scores.length === 0) {
    return null;
  }

  return {
    totalResponses: scores.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
  };
}
