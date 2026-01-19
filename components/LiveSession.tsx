"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, MessageCircle, Volume2 } from "lucide-react";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  isRecording?: boolean;
}

interface LiveSessionProps {
  question: string;
  onComplete: (fullResponse: string) => void;
  onEndSession: () => void;
}

export function LiveSession({ question, onComplete, onEndSession }: LiveSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SILENCE_TIMEOUT = 2000;

  // Initialize with first question
  useEffect(() => {
    const firstMessage: Message = {
      id: "initial",
      role: "ai",
      content: question,
    };
    setMessages([firstMessage]);
    speakText(question);
  }, [question]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = ['Samantha', 'Karen', 'Ava', 'Allison', 'Susan'];
      let voice = voices.find(v => v.name.includes('(Enhanced)') && v.lang.startsWith('en'));
      if (!voice) {
        voice = voices.find(v => preferredVoices.some(p => v.name.includes(p)));
      }
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en'));
      }
      if (voice) utterance.voice = voice;

      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      setIsAISpeaking(true);

      utterance.onend = () => {
        setIsAISpeaking(false);
        resolve();
      };

      utterance.onerror = () => {
        setIsAISpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start audio level monitoring
      monitorAudioLevel();

      // Setup speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);

        // Reset silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          if (transcript.trim()) {
            finishUserMessage(transcript.trim());
          }
        }, SILENCE_TIMEOUT);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          stopRecording();
        }
      };

      recognition.onend = () => {
        if (isRecording && !isAISpeaking) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setIsListening(false);
    setAudioLevel(0);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(average / 128, 1));
      animationFrameRef.current = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  };

  const finishUserMessage = async (transcript: string) => {
    stopRecording();
    setCurrentTranscript("");

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: transcript,
    };
    setMessages(prev => [...prev, userMessage]);

    // Generate AI follow-up
    await generateAIResponse(transcript);
  };

  const generateAIResponse = async (userInput: string) => {
    // Simple follow-up questions based on conversation flow
    const followUps = [
      "Interesting choice. What are the specific pain points for that persona?",
      "How would you prioritize the features you mentioned?",
      "What metrics would you use to measure success?",
      "How would you handle the technical constraints?",
      "What's your MVP approach for this?",
    ];

    const response = followUps[Math.min(messages.filter(m => m.role === "ai").length, followUps.length - 1)];

    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "ai",
      content: response,
    };

    setMessages(prev => [...prev, aiMessage]);

    await speakText(response);

    // Auto-start listening after AI finishes
    setTimeout(() => {
      startRecording();
    }, 500);
  };

  const handleEndSession = () => {
    stopRecording();
    window.speechSynthesis.cancel();

    // Compile full response
    const userMessages = messages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .join("\n\n");

    onComplete(userMessages);
    onEndSession();
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (currentTranscript.trim()) {
        finishUserMessage(currentTranscript.trim());
      } else {
        stopRecording();
      }
    } else {
      startRecording();
    }
  };

  return (
    <div className="card-elevated rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs font-semibold text-lavender uppercase tracking-wider">Live Session</span>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto p-5 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {message.role === "ai" ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-xs font-semibold text-coral uppercase mt-3">You</span>
                  <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current recording indicator */}
        {isRecording && currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 flex-row-reverse"
          >
            <span className="text-xs font-semibold text-coral uppercase mt-3">You</span>
            <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
              {/* Voice waveform visualization */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-background/60 rounded-full"
                    animate={{
                      height: isListening ? [8, 16 + Math.random() * 16, 8] : 8,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed opacity-80">{currentTranscript}</p>
            </div>
          </motion.div>
        )}

        {/* Recording in progress without transcript */}
        {isRecording && !currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 flex-row-reverse"
          >
            <span className="text-xs font-semibold text-coral uppercase mt-3">You</span>
            <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3">
              <div className="flex items-center gap-1">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-background/60 rounded-full"
                    animate={{
                      height: [8, 12 + audioLevel * 20, 8],
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? "bg-coral text-white shadow-lg"
                : "bg-coral/10 text-coral hover:bg-coral/20"
            }`}
          >
            {isRecording ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>

          <span className="text-sm text-muted-foreground">
            {isAISpeaking ? "AI Speaking..." : isRecording ? "Listening..." : "Tap to speak"}
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEndSession}
            className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            End Session
          </motion.button>
        </div>
      </div>
    </div>
  );
}
