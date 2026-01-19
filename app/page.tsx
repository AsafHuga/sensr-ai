"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Award,
  Users,
  Keyboard,
  Mic
} from "lucide-react";
import { questions, Question } from "@/lib/questions";
import { JuryVerdict, InterviewerVerdict, FinalDecision } from "@/lib/interviewers/types";
import { VoiceRecorder } from "@/components/VoiceRecorder";

type InputMode = 'type' | 'record';

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0]);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JuryVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('type');

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate");
      }

      const data: JuryVerdict = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to evaluate your response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
    setAnswer("");
    setResult(null);
    setError(null);
  };

  const handleTranscriptUpdate = (transcript: string) => {
    setAnswer(transcript);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Premium Header */}
        <header className="border-b border-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Interview Jury AI</h1>
                  <p className="text-xs text-muted-foreground">Premium PM Interview Practice</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Users className="w-4 h-4" />
                <span>3 Expert Reviewers</span>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient">Ace Your Next</span>
                <br />
                <span className="text-white">PM Interview</span>
              </h2>
            </motion.div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Get real-time feedback from our AI hiring panel. Practice with realistic questions
              and receive detailed evaluation from three expert perspectives.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-foreground/80">Instant Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-foreground/80">Score Breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-foreground/80">Expert Analysis</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Question & Answer */}
            <div className="space-y-6">
              {/* Question Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-strong rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-sm font-medium text-purple-400">
                      {currentQuestion.category.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNewQuestion}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-foreground/80 hover:text-foreground"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Question
                  </motion.button>
                </div>
                <h2 className="text-2xl font-semibold text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </motion.div>

              {/* Answer Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-strong rounded-2xl p-6 shadow-2xl"
              >
                {/* Mode Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <label className="block text-sm font-semibold text-foreground">
                    Your Answer
                  </label>
                  <div className="flex items-center gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
                    <button
                      onClick={() => setInputMode('type')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'type'
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Keyboard className="w-4 h-4" />
                      Type
                    </button>
                    <button
                      onClick={() => setInputMode('record')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'record'
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      Record
                    </button>
                  </div>
                </div>

                {/* Input Area */}
                <AnimatePresence mode="wait">
                  {inputMode === 'type' ? (
                    <motion.div
                      key="type"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Structure your response clearly. Use examples, data, and demonstrate strategic thinking..."
                        className="w-full h-72 p-4 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground/50"
                        disabled={isLoading}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="record"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VoiceRecorder
                        onTranscriptUpdate={handleTranscriptUpdate}
                        disabled={isLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {answer.length} characters
                    </span>
                    {answer.length > 100 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Good length
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={isLoading || !answer.trim()}
                    className="flex items-center gap-2 px-6 py-3 gradient-purple rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit for Review
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {isLoading && <LoadingState key="loading" />}
                {result && <ResultsPanel key="results" result={result} />}
                {!isLoading && !result && <EmptyState key="empty" />}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-strong rounded-2xl p-12 shadow-2xl"
    >
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-xl font-semibold text-white">Jury Deliberating</h3>
          <p className="text-sm text-muted-foreground">Our panel of experts is evaluating your response...</p>
        </div>

        <div className="w-full space-y-3">
          {[
            { name: "Sarah Chen", role: "VP Product", delay: 0 },
            { name: "Marcus Rodriguez", role: "Bar Raiser", delay: 0.2 },
            { name: "Jamie Park", role: "Recruiter", delay: 0.4 }
          ].map((interviewer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: interviewer.delay }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">{interviewer.name}</p>
                <p className="text-xs text-muted-foreground">{interviewer.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  const interviewers = [
    {
      name: "Sarah Chen",
      role: "VP Product",
      gradient: "gradient-purple",
      initials: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Bar Raiser",
      gradient: "gradient-blue",
      initials: "MR"
    },
    {
      name: "Jamie Park",
      role: "Recruiter",
      gradient: "gradient-green",
      initials: "JP"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-strong rounded-2xl p-12 shadow-2xl"
    >
      <div className="text-center space-y-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-16 h-16 mx-auto text-purple-400" />
        </motion.div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white">Meet Your Interview Panel</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three expert AI interviewers ready to provide comprehensive feedback on your response
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {interviewers.map((interviewer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-3"
            >
              <div className={`w-20 h-20 ${interviewer.gradient} rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                {interviewer.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{interviewer.name}</p>
                <p className="text-xs text-muted-foreground">{interviewer.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5">
          <p className="text-sm text-muted-foreground">
            Submit your answer to receive detailed feedback and scores
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ResultsPanel({ result }: { result: JuryVerdict }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Final Verdict */}
      <FinalVerdictCard decision={result.finalDecision} score={result.overallScore} />

      {/* Strengths & Red Flags */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-5 border border-green-500/20 bg-green-500/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-green-300">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {result.strengths.length > 0 ? (
              result.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-sm text-green-200/90 flex items-start gap-2"
                >
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{s}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-sm text-green-300/50 italic">No strong positives identified</li>
            )}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-5 border border-red-500/20 bg-red-500/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h4 className="font-semibold text-red-300">Red Flags</h4>
          </div>
          <ul className="space-y-2">
            {result.redFlags.length > 0 ? (
              result.redFlags.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-sm text-red-200/90 flex items-start gap-2"
                >
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{f}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-sm text-red-300/50 italic">No red flags identified</li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Score Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-xl p-6 shadow-lg"
      >
        <h4 className="font-semibold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Score Breakdown
        </h4>
        <div className="space-y-4">
          {result.breakdown.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.dimension}</span>
                <span className="text-sm font-bold text-purple-400">{item.score}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                  className="h-full gradient-purple"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Disagreements */}
      <AnimatePresence>
        {result.disagreements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-5 border border-amber-500/20 bg-amber-500/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-amber-300">Panel Disagreements</h4>
            </div>
            <div className="space-y-3">
              {result.disagreements.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5">
                  <p className="text-sm font-medium text-amber-200 mb-2">{d.topic}</p>
                  <div className="flex flex-wrap gap-2">
                    {d.positions.map((p, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        {p.interviewer}: {p.stance}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Individual Verdicts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Individual Evaluations
        </h4>
        {result.interviewerVerdicts.map((verdict, i) => (
          <InterviewerCard key={i} verdict={verdict} delay={0.4 + i * 0.1} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function FinalVerdictCard({ decision, score }: { decision: FinalDecision; score: number }) {
  const config = {
    PASS: {
      gradient: "gradient-green",
      icon: CheckCircle2,
      label: "STRONG HIRE",
      glow: "glow-green",
      borderColor: "border-green-500/30"
    },
    BORDERLINE: {
      gradient: "gradient-amber",
      icon: AlertCircle,
      label: "BORDERLINE",
      glow: "glow-amber",
      borderColor: "border-amber-500/30"
    },
    FAIL: {
      gradient: "gradient-red",
      icon: XCircle,
      label: "NO HIRE",
      glow: "glow-red",
      borderColor: "border-red-500/30"
    },
  };

  const { gradient, icon: Icon, label, glow, borderColor } = config[decision];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`${gradient} rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl ${glow} border ${borderColor}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Icon className="w-12 h-12 mx-auto mb-4 text-white" />
        </motion.div>
        <p className="text-sm text-white/80 mb-2 font-medium uppercase tracking-wide">Final Verdict</p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-4"
        >
          {label}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm"
        >
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-sm text-white/80">/ 100</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function InterviewerCard({ verdict, delay }: { verdict: InterviewerVerdict; delay: number }) {
  const [expanded, setExpanded] = useState(false);

  const verdictConfig = {
    strong_pass: {
      bg: "bg-green-500/10",
      text: "text-green-300",
      border: "border-green-500/30",
      label: "Strong Pass"
    },
    pass: {
      bg: "bg-green-500/5",
      text: "text-green-400",
      border: "border-green-500/20",
      label: "Pass"
    },
    borderline: {
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      border: "border-amber-500/30",
      label: "Borderline"
    },
    fail: {
      bg: "bg-red-500/5",
      text: "text-red-400",
      border: "border-red-500/20",
      label: "Fail"
    },
    strong_fail: {
      bg: "bg-red-500/10",
      text: "text-red-300",
      border: "border-red-500/30",
      label: "Strong Fail"
    },
  };

  const config = verdictConfig[verdict.verdict];

  const interviewerInfo = {
    hiring_manager: {
      name: "Sarah Chen",
      title: "VP of Product",
      gradient: "gradient-purple",
      initials: "SC"
    },
    senior_pm: {
      name: "Marcus Rodriguez",
      title: "Principal PM (Bar Raiser)",
      gradient: "gradient-blue",
      initials: "MR"
    },
    recruiter: {
      name: "Jamie Park",
      title: "Senior Recruiter",
      gradient: "gradient-green",
      initials: "JP"
    },
  };

  const info = interviewerInfo[verdict.interviewer as keyof typeof interviewerInfo];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-strong rounded-xl overflow-hidden shadow-lg border border-white/5"
    >
      <motion.div
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
        className="p-5 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${info.gradient} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {info.initials}
            </div>
            <div>
              <p className="font-semibold text-foreground">{info.name}</p>
              <p className="text-sm text-muted-foreground">{info.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${config.bg} ${config.text} border ${config.border}`}>
              {config.label}
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-5 space-y-5">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {verdict.rawFeedback}
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-foreground/80">Detailed Scores</h5>
                {verdict.scores.map((score, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {score.dimension}
                      </span>
                      <span className="text-xs font-bold text-purple-400">
                        {score.score}/5
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <motion.div
                          key={n}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.05 * n }}
                          className={`h-1.5 flex-1 rounded-full ${
                            n <= score.score
                              ? "bg-purple-500"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
