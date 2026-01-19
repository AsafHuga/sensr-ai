"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  Volume2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  FrameworkStep,
  frameworkSteps,
  stepOrder,
  getStepProgress,
} from "@/lib/interview-flow";

interface Message {
  role: "user" | "coach";
  content: string;
  step: FrameworkStep;
}

interface GuidedInterviewProps {
  question: string;
  onComplete: (fullResponse: string) => void;
}

export default function GuidedInterview({ question, onComplete }: GuidedInterviewProps) {
  const [currentStep, setCurrentStep] = useState<FrameworkStep>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Speak text
  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for natural feel
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      // Get voices and pick the best one
      const selectBestVoice = (voices: SpeechSynthesisVoice[]) => {
        // Priority order: Premium/Enhanced voices first, then good defaults
        const preferredVoices = [
          // Premium Mac voices (sound most natural)
          'Ava',
          'Allison',
          'Susan',
          'Zoe',
          'Samantha',
          // Google voices (good quality)
          'Google US English',
          'Google UK English Female',
          // Microsoft voices
          'Microsoft Zira',
          'Microsoft Jenny',
        ];

        // First try to find enhanced versions
        let voice = voices.find(v =>
          v.name.includes('(Enhanced)') && v.lang.startsWith('en')
        );

        // Then try preferred voices
        if (!voice) {
          for (const preferred of preferredVoices) {
            voice = voices.find(v =>
              v.name.includes(preferred) && v.lang.startsWith('en')
            );
            if (voice) break;
          }
        }

        // Fallback to any English female voice
        if (!voice) {
          voice = voices.find(v =>
            v.lang.startsWith('en-US') &&
            (v.name.toLowerCase().includes('female') || !v.name.toLowerCase().includes('male'))
          );
        }

        // Last fallback: any English voice
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith('en'));
        }

        return voice;
      };

      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          const voice = selectBestVoice(voices);
          if (voice) {
            utterance.voice = voice;
            console.log("Using voice:", voice.name);
          }
          window.speechSynthesis.speak(utterance);
        };
      } else {
        const voice = selectBestVoice(voices);
        if (voice) {
          utterance.voice = voice;
          console.log("Using voice:", voice.name);
        }
        window.speechSynthesis.speak(utterance);
      }

      // Timeout fallback
      setTimeout(() => {
        setIsSpeaking(false);
        resolve();
      }, 60000);
    });
  };

  // Start listening
  const startListening = () => {
    setError(null);

    if (typeof window === "undefined") {
      setError("Not in browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Please use Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("✅ Listening started");
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        console.log("📝 Transcript:", text);
        setTranscript(text);

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          console.log("⏱️ Silence detected");
          if (text.trim()) {
            submitTranscript(text.trim());
          }
        }, 3000);
      };

      recognition.onerror = (event: any) => {
        console.error("❌ Recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone blocked. Click the 🔒 in your browser's address bar and allow microphone.");
        } else if (event.error !== "no-speech") {
          setError(`Error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("🔴 Recognition ended");
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (e: any) {
      console.error("Failed to start:", e);
      setError(`Failed to start: ${e.message}`);
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Submit transcript
  const submitTranscript = async (text: string) => {
    stopListening();
    setTranscript("");

    // Add user message
    const userMsg: Message = { role: "user", content: text, step: currentStep };
    setMessages(prev => [...prev, userMsg]);
    setUserResponses(prev => ({ ...prev, [currentStep]: text }));

    // For intro, just move to next step
    if (currentStep === "intro") {
      await moveToNextStep();
      return;
    }

    // Get coach response
    setIsProcessing(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          currentStep,
          userResponse: text,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      // Add coach message
      const coachMsg: Message = { role: "coach", content: data.feedback, step: currentStep };
      setMessages(prev => [...prev, coachMsg]);

      // Speak and continue
      await speak(data.feedback);
      setIsProcessing(false);

      if (data.shouldProgress) {
        await moveToNextStep();
      } else {
        startListening();
      }
    } catch (e) {
      console.error("API error:", e);
      setIsProcessing(false);
      setError("Failed to get response. Try again.");
      startListening();
    }
  };

  // Move to next step
  const moveToNextStep = async () => {
    const idx = stepOrder.indexOf(currentStep);
    if (idx < stepOrder.length - 1) {
      const nextStep = stepOrder[idx + 1];
      setCurrentStep(nextStep);

      if (nextStep === "complete") {
        // Complete!
        const fullResponse = Object.entries(userResponses)
          .filter(([s]) => s !== "intro" && s !== "complete")
          .map(([s, r]) => `**${frameworkSteps[s as FrameworkStep].title}:**\n${r}`)
          .join("\n\n");

        const completeMsg: Message = {
          role: "coach",
          content: "Excellent! You've completed the framework. Click 'Submit for Evaluation' to get feedback.",
          step: "complete",
        };
        setMessages(prev => [...prev, completeMsg]);
        await speak(completeMsg.content);
        onComplete(fullResponse);
      } else {
        // Next step
        const prompt = frameworkSteps[nextStep].prompt;
        const coachMsg: Message = { role: "coach", content: prompt, step: nextStep };
        setMessages(prev => [...prev, coachMsg]);
        await speak(prompt);
        startListening();
      }
    }
  };

  // Start the interview
  const handleStart = async () => {
    setIsStarted(true);
    const intro = `Welcome! I'll guide you through this product question using a framework. Today's question is: "${question}". Ready to begin? Just say something like "Yes, let's go" when you're ready.`;
    const introMsg: Message = { role: "coach", content: intro, step: "intro" };
    setMessages([introMsg]);
    await speak(intro);
    startListening();
  };

  const progress = getStepProgress(currentStep);
  const stepConfig = frameworkSteps[currentStep];

  // Start screen
  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold">Voice Interview</h3>
          <p className="text-sm text-muted-foreground">
            Have a conversation with your AI coach. Speak naturally - it will listen and respond.
          </p>
          <ul className="text-sm text-left space-y-2 text-muted-foreground">
            <li>✓ Uses your microphone (Chrome works best)</li>
            <li>✓ Auto-detects when you stop speaking</li>
            <li>✓ Coach speaks responses aloud</li>
          </ul>
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-bold text-purple-500">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {stepOrder.slice(1, -1).map((step, i) => (
            <div
              key={step}
              className={`text-xs ${
                step === currentStep ? "text-purple-500 font-bold" :
                stepOrder.indexOf(step) < stepOrder.indexOf(currentStep) ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {i + 1}. {frameworkSteps[step].shortTitle}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 flex items-center gap-2">
        {isListening && (
          <span className="flex items-center gap-1 text-sm text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening...
          </span>
        )}
        {isSpeaking && (
          <span className="flex items-center gap-1 text-sm text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">
            <Volume2 className="w-4 h-4" />
            Speaking...
          </span>
        )}
        {isProcessing && (
          <span className="flex items-center gap-1 text-sm text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Tips */}
      {stepConfig.tips.length > 0 && currentStep !== "intro" && currentStep !== "complete" && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-500">Tips</span>
          </div>
          <ul className="text-xs text-amber-600 space-y-1">
            {stepConfig.tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[150px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-muted border border-border"
            }`}>
              {msg.role === "coach" && (
                <div className="flex items-center gap-1 mb-1 text-purple-500">
                  <MessageCircle className="w-3 h-3" />
                  <span className="text-xs font-semibold">Coach</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Live transcript */}
        {transcript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-purple-500/10 border border-purple-500/20 border-dashed">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-purple-500">You're saying...</span>
              </div>
              <p className="text-muted-foreground">{transcript}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mic button */}
      <div className="border-t pt-4">
        {currentStep !== "complete" ? (
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                if (isListening) {
                  if (transcript.trim()) {
                    submitTranscript(transcript.trim());
                  } else {
                    stopListening();
                  }
                } else if (!isSpeaking && !isProcessing) {
                  startListening();
                }
              }}
              disabled={isSpeaking || isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <MicOff className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              {isListening
                ? "Tap to send (or wait 3 sec)"
                : isSpeaking
                ? "Coach speaking..."
                : isProcessing
                ? "Processing..."
                : "Tap to speak"}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="font-semibold">Complete!</p>
            <p className="text-sm text-muted-foreground">Ready for evaluation</p>
          </div>
        )}
      </div>
    </div>
  );
}
