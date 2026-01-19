"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertCircle, Volume2 } from "lucide-react";

interface VoiceRecorderProps {
  onTranscriptUpdate: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscriptUpdate, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);

    try {
      // Request microphone permission and setup audio visualization
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
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalText += text + ' ';
          } else {
            interimText += text;
          }
        }

        if (finalText) {
          setTranscript((prev) => {
            const newTranscript = prev + finalText;
            onTranscriptUpdate(newTranscript);
            return newTranscript;
          });
        }

        setInterimTranscript(interimText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable microphone permissions.');
        } else {
          setError('An error occurred. Please try again.');
        }
        stopRecording();
      };

      recognition.onend = () => {
        if (isRecording) {
          // Restart if still recording (handles automatic stops)
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setInterimTranscript('');
    setAudioLevel(0);

    // Finalize transcript
    if (transcript || interimTranscript) {
      const finalTranscript = transcript + interimTranscript;
      setTranscript(finalTranscript);
      onTranscriptUpdate(finalTranscript);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(average / 128, 1)); // Normalize to 0-1

      animationFrameRef.current = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setRecordingTime(0);
    onTranscriptUpdate('');
  };

  if (!isSupported) {
    return (
      <div className="glass rounded-xl p-6 border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300 mb-1">
              Voice recording not supported
            </p>
            <p className="text-xs text-amber-200/70">
              Your browser doesn't support voice recording. Please use Chrome, Edge, or Safari, or switch to typing mode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        {/* Microphone Button */}
        <motion.button
          whileHover={{ scale: isRecording ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:shadow-purple-500/50'
          }`}
        >
          {/* Pulsing rings when recording */}
          {isRecording && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-red-500"
                style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
            </>
          )}

          {/* Icon */}
          <div className="relative z-10">
            {isRecording ? (
              <Square className="w-8 h-8 text-white" fill="white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </div>
        </motion.button>

        {/* Recording Status */}
        <div className="text-center space-y-2">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-lg font-semibold text-white">
                    Recording
                  </span>
                </div>
                <p className="text-2xl font-mono text-purple-400">
                  {formatTime(recordingTime)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-sm font-medium text-muted-foreground">
                  {transcript ? 'Click to continue recording' : 'Click the microphone to start'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audio Level Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1 h-6 rounded-full transition-colors ${
                    audioLevel * 5 > i ? 'bg-purple-500' : 'bg-white/10'
                  }`}
                  animate={{
                    height: audioLevel * 5 > i ? [24, 32, 24] : 24,
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Transcript */}
      {(transcript || interimTranscript || isRecording) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Live Transcript
            </label>
            {!isRecording && transcript && (
              <button
                onClick={clearTranscript}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl min-h-[100px] max-h-[200px] overflow-y-auto">
            <p className="text-sm text-foreground leading-relaxed">
              {transcript}
              {interimTranscript && (
                <span className="text-muted-foreground italic">
                  {interimTranscript}
                </span>
              )}
              {isRecording && !transcript && !interimTranscript && (
                <span className="text-muted-foreground italic">
                  Start speaking...
                </span>
              )}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
