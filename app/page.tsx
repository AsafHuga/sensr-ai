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
  Mic,
  MessageSquare,
  MessageCircle
} from "lucide-react";
import { questions, Question } from "@/lib/questions";
import { JuryVerdict, InterviewerVerdict, FinalDecision } from "@/lib/interviewers/types";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import GuidedInterview from "@/components/GuidedInterview";

type InputMode = 'type' | 'record' | 'guided';

interface PercentileData {
  percentile: number;
  rank: number;
  totalResponses: number;
  stats: {
    totalResponses: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  } | null;
}

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0]);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JuryVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('record');
  const [percentileData, setPercentileData] = useState<PercentileData | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setPercentileData(null);

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

      // Save score and get percentile data
      try {
        const scoresResponse = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            score: data.overallScore,
          }),
        });

        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          setPercentileData(scoresData);
        }
      } catch (scoreErr) {
        console.error("Failed to save score:", scoreErr);
      }
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
    setPercentileData(null);
  };

  const handleTranscriptUpdate = (transcript: string) => {
    setAnswer(transcript);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Warm ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-coral/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-lavender/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Clean Header */}
        <header className="border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl gradient-coral flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Sensr AI</h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Users className="w-4 h-4" />
                <span>3 Expert Reviewers</span>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Hero Section - Two column with chat preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-8 sm:mb-16"
          >
            {/* Left - Text content */}
            <div className="text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-coral" />
                <span className="text-sm font-medium text-foreground">AI Voice Interview Coach</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                  <span className="text-foreground">Master the</span>
                  <br />
                  <span className="text-foreground">Product Sense</span>
                  <br />
                  <span className="text-foreground">Interview. </span>
                  <span className="text-gradient-coral">Out Loud.</span>
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base text-muted-foreground mb-8 leading-relaxed"
              >
                Stop practicing in your head. Train with an AI interviewer that listens,
                challenges your frameworks, and grades your execution, just like a real PM interview at Meta or Google.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-coral" />
                  <span className="text-foreground/80 text-xs sm:text-sm">Instant Feedback</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-coral" />
                  <span className="text-foreground/80 text-xs sm:text-sm">Score Breakdown</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-coral" />
                  <span className="text-foreground/80 text-xs sm:text-sm">Expert Analysis</span>
                </div>
              </motion.div>
            </div>

            {/* Right - Chat preview card (hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block card-elevated rounded-2xl p-5 shadow-xl"
            >
              {/* Window header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-semibold text-lavender uppercase tracking-wider">Live Session</span>
              </div>

              {/* Chat messages */}
              <div className="space-y-4 py-4">
                {/* AI message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-foreground">Design an alarm clock for the blind. Who is the primary persona you'd focus on?</p>
                  </div>
                </div>

                {/* User message with waveform */}
                <div className="flex items-start gap-3 flex-row-reverse">
                  <span className="text-xs font-semibold text-coral uppercase mt-3">You</span>
                  <div className="bg-foreground rounded-2xl rounded-tr-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-background/60 rounded-full"
                          style={{ height: `${8 + Math.sin(i * 0.8) * 8 + 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI follow-up */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-foreground">Interesting choice. What are the specific pain points for that persona regarding <em className="text-coral">haptic feedback</em>?</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-coral" />
                </div>
                <span className="text-sm text-muted-foreground">Listening...</span>
                <span className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground">End Session</span>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Question & Answer */}
            <div className="space-y-6">
              {/* Question Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elevated rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full tag-coral uppercase tracking-wide">
                    {currentQuestion.category.replace("_", " ")}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewQuestion}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Question
                  </motion.button>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </motion.div>

              {/* Answer Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-elevated rounded-2xl p-6"
              >
                {/* Mode Toggle */}
                <div className="flex items-center justify-between mb-5">
                  <label className="block text-sm font-semibold text-foreground">
                    Your Answer
                  </label>
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
                    <button
                      onClick={() => setInputMode('record')}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'record'
                          ? 'bg-foreground text-background shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span className="hidden sm:inline">Record</span>
                    </button>
                    <button
                      onClick={() => setInputMode('guided')}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'guided'
                          ? 'bg-foreground text-background shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Guided</span>
                    </button>
                    <button
                      onClick={() => setInputMode('type')}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'type'
                          ? 'bg-foreground text-background shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Keyboard className="w-4 h-4" />
                      <span className="hidden sm:inline">Type</span>
                    </button>
                  </div>
                </div>

                {/* Input Area */}
                <AnimatePresence mode="wait">
                  {inputMode === 'type' && (
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
                        className="w-full h-72 p-4 bg-muted/30 border-2 border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral transition-all text-foreground placeholder:text-muted-foreground/60"
                        disabled={isLoading}
                      />
                    </motion.div>
                  )}
                  {inputMode === 'record' && (
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
                  {inputMode === 'guided' && (
                    <motion.div
                      key="guided"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-[400px]"
                    >
                      <GuidedInterview
                        question={currentQuestion.question}
                        onComplete={(fullResponse) => setAnswer(fullResponse)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer - Only show for type and record modes */}
                {inputMode !== 'guided' && (
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {answer.length} characters
                      </span>
                      {answer.length > 100 && (
                        <span className="text-xs px-2.5 py-1 rounded-full tag-green font-medium">
                          Good length
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={isLoading || !answer.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-semibold shadow-md hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
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
                          Get Feedback
                        </>
                      )}
                    </motion.button>
                  </div>
                )}

                {/* Submit button for guided mode - only shows when answer is populated */}
                {inputMode === 'guided' && answer.trim() && (
                  <div className="mt-5 flex items-center justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-semibold shadow-md hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
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
                          Submit for Evaluation
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="card-soft rounded-xl p-4 border border-red-200 bg-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {isLoading && <LoadingState key="loading" />}
                {result && <ResultsPanel key="results" result={result} percentileData={percentileData} />}
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
      className="card-elevated rounded-2xl p-12 shadow-xl"
    >
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full border-4 border-coral/20 border-t-coral"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-8 h-8 text-coral" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Jury Deliberating</h3>
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
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
            >
              <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
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
      gradient: "gradient-coral",
      initials: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Bar Raiser",
      gradient: "gradient-lavender",
      initials: "MR"
    },
    {
      name: "Jamie Park",
      role: "Recruiter",
      gradient: "gradient-success",
      initials: "JP"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-elevated rounded-2xl p-12 shadow-xl"
    >
      <div className="text-center space-y-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-16 h-16 mx-auto text-coral" />
        </motion.div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">Meet Your Interview Panel</h3>
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

        <div className="pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Submit your answer to receive detailed feedback and scores
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ResultsPanel({ result, percentileData }: { result: JuryVerdict; percentileData: PercentileData | null }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Final Verdict */}
      <FinalVerdictCard decision={result.finalDecision} score={result.overallScore} percentileData={percentileData} />

      {/* Strengths & Red Flags */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card-soft rounded-xl p-5 border border-green-200 bg-green-50"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-700">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {result.strengths.length > 0 ? (
              result.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-sm text-green-800 flex items-start gap-2"
                >
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{s}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-sm text-green-600/60 italic">No strong positives identified</li>
            )}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card-soft rounded-xl p-5 border border-red-200 bg-red-50"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-red-700">Red Flags</h4>
          </div>
          <ul className="space-y-2">
            {result.redFlags.length > 0 ? (
              result.redFlags.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-sm text-red-800 flex items-start gap-2"
                >
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{f}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-sm text-red-600/60 italic">No red flags identified</li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Score Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-elevated rounded-xl p-6 shadow-md"
      >
        <h4 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-coral" />
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
                <span className="text-sm font-bold text-coral">{item.score}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                  className="h-full gradient-coral"
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
            className="card-soft rounded-xl p-5 border border-amber-200 bg-amber-50"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-700">Panel Disagreements</h4>
            </div>
            <div className="space-y-3">
              {result.disagreements.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-amber-100/50">
                  <p className="text-sm font-medium text-amber-800 mb-2">{d.topic}</p>
                  <div className="flex flex-wrap gap-2">
                    {d.positions.map((p, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200"
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
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-coral" />
          Individual Evaluations
        </h4>
        {result.interviewerVerdicts.map((verdict, i) => (
          <InterviewerCard key={i} verdict={verdict} delay={0.4 + i * 0.1} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function FinalVerdictCard({ decision, score, percentileData }: { decision: FinalDecision; score: number; percentileData: PercentileData | null }) {
  const config = {
    PASS: {
      gradient: "gradient-green",
      icon: CheckCircle2,
      label: "STRONG HIRE",
      glow: "glow-green",
      borderColor: "border-green-500/30",
      textColor: "text-green-900",
      textMuted: "text-green-800/70",
      textLight: "text-green-800/50",
      dividerColor: "bg-green-800/20",
      badgeBg: "bg-green-800/10"
    },
    BORDERLINE: {
      gradient: "gradient-coral",
      icon: AlertCircle,
      label: "BORDERLINE",
      glow: "glow-coral",
      borderColor: "border-orange-400/30",
      textColor: "text-orange-950",
      textMuted: "text-orange-900/70",
      textLight: "text-orange-900/50",
      dividerColor: "bg-orange-900/20",
      badgeBg: "bg-orange-900/10"
    },
    FAIL: {
      gradient: "gradient-red",
      icon: XCircle,
      label: "NO HIRE",
      glow: "glow-red",
      borderColor: "border-red-500/30",
      textColor: "text-red-950",
      textMuted: "text-red-900/70",
      textLight: "text-red-900/50",
      dividerColor: "bg-red-900/20",
      badgeBg: "bg-red-900/10"
    },
  };

  const { gradient, icon: Icon, label, glow, borderColor, textColor, textMuted, textLight, dividerColor, badgeBg } = config[decision];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`${gradient} rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl ${glow} border ${borderColor}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Icon className={`w-12 h-12 mx-auto mb-4 ${textColor}`} />
        </motion.div>
        <p className={`text-sm ${textMuted} mb-2 font-medium uppercase tracking-wide`}>Final Verdict</p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-4xl font-bold ${textColor} mb-4`}
        >
          {label}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badgeBg} backdrop-blur-sm`}
        >
          <span className={`text-2xl font-bold ${textColor}`}>{score}</span>
          <span className={`text-sm ${textMuted}`}>/ 100</span>
        </motion.div>

        {/* Percentile Ranking */}
        {percentileData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mt-6 pt-6 border-t ${dividerColor}`}
          >
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className={`w-4 h-4 sm:w-5 sm:h-5 ${textMuted}`} />
                  <span className={`text-xl sm:text-2xl font-bold ${textColor}`}>Top {percentileData.percentile}%</span>
                </div>
                <p className={`text-xs ${textLight}`}>of all responses</p>
              </div>
              <div className={`hidden sm:block w-px h-10 ${dividerColor}`} />
              <div className="text-center">
                <p className={`text-base sm:text-lg font-bold ${textColor}`}>#{percentileData.rank}</p>
                <p className={`text-xs ${textLight}`}>out of {percentileData.totalResponses}</p>
              </div>
              {percentileData.stats && (
                <>
                  <div className={`hidden sm:block w-px h-10 ${dividerColor}`} />
                  <div className="text-center">
                    <p className={`text-base sm:text-lg font-bold ${textColor}`}>{percentileData.stats.averageScore}</p>
                    <p className={`text-xs ${textLight}`}>avg score</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function InterviewerCard({ verdict, delay }: { verdict: InterviewerVerdict; delay: number }) {
  const [expanded, setExpanded] = useState(false);

  const verdictConfig = {
    strong_pass: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      label: "Strong Pass"
    },
    pass: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
      label: "Pass"
    },
    borderline: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      label: "Borderline"
    },
    fail: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      label: "Fail"
    },
    strong_fail: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      label: "Strong Fail"
    },
  };

  const config = verdictConfig[verdict.verdict];

  const interviewerInfo = {
    hiring_manager: {
      name: "Sarah Chen",
      title: "VP of Product",
      gradient: "gradient-coral",
      initials: "SC"
    },
    senior_pm: {
      name: "Marcus Rodriguez",
      title: "Principal PM (Bar Raiser)",
      gradient: "gradient-lavender",
      initials: "MR"
    },
    recruiter: {
      name: "Jamie Park",
      title: "Senior Recruiter",
      gradient: "gradient-success",
      initials: "JP"
    },
  };

  const info = interviewerInfo[verdict.interviewer as keyof typeof interviewerInfo];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-elevated rounded-xl overflow-hidden shadow-md"
    >
      <motion.div
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
        className="p-5 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${info.gradient} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md`}>
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
            <div className="px-5 pb-5 border-t border-border/50 pt-5 space-y-5">
              <div className="p-4 rounded-lg bg-muted/50">
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
                      <span className="text-xs font-bold text-coral">
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
                              ? "bg-coral"
                              : "bg-muted"
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
