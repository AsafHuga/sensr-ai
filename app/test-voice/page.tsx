"use client";

import { useState } from "react";

export default function TestVoice() {
  const [status, setStatus] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const addStatus = (msg: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testMicrophone = async () => {
    addStatus("Testing microphone access...");

    // Check if mediaDevices exists
    if (!navigator.mediaDevices) {
      addStatus("❌ navigator.mediaDevices not available");
      addStatus("Try using HTTPS or a different browser");
      return;
    }

    try {
      addStatus("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addStatus("✅ Microphone access granted!");

      // List available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(d => d.kind === 'audioinput');
      addStatus(`Found ${mics.length} microphone(s):`);
      mics.forEach((mic, i) => {
        addStatus(`  ${i + 1}. ${mic.label || 'Unknown microphone'}`);
      });

      // Test if we're getting audio
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let maxLevel = 0;

      addStatus("🎤 Speak now to test audio levels...");

      // Check audio level for 3 seconds
      const checkInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const level = dataArray.reduce((a, b) => a + b) / dataArray.length;
        if (level > maxLevel) maxLevel = level;
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        audioContext.close();
        stream.getTracks().forEach(track => track.stop());

        if (maxLevel > 5) {
          addStatus(`✅ Audio detected! Max level: ${Math.round(maxLevel)}`);
        } else {
          addStatus(`⚠️ No audio detected. Max level: ${Math.round(maxLevel)}`);
          addStatus("Check: Is your mic muted? Is the right mic selected?");
        }
      }, 3000);

    } catch (err: any) {
      addStatus(`❌ Microphone error: ${err.name} - ${err.message}`);
      if (err.name === 'NotAllowedError') {
        addStatus("Permission denied. Click 🔒 → Allow microphone");
      } else if (err.name === 'NotFoundError') {
        addStatus("No microphone found! Connect a microphone.");
      }
    }
  };

  const testSpeechRecognition = () => {
    addStatus("Testing speech recognition...");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addStatus("❌ Speech recognition NOT supported in this browser!");
      addStatus("Please use Google Chrome");
      return;
    }

    addStatus("✅ Speech recognition is supported");

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        addStatus("🎤 Listening started - speak now!");
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        addStatus(`📝 Heard: "${text}"`);
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        addStatus(`❌ Error: ${event.error}`);
        if (event.error === "not-allowed") {
          addStatus("⚠️ Microphone permission denied!");
          addStatus("Click the lock icon 🔒 in URL bar → Allow microphone");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        addStatus("🔴 Listening ended");
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      addStatus(`❌ Failed to start: ${err.message}`);
    }
  };

  const testSpeechSynthesis = () => {
    addStatus("Testing text-to-speech...");

    if (!window.speechSynthesis) {
      addStatus("❌ Text-to-speech NOT supported!");
      return;
    }

    addStatus("✅ Text-to-speech is supported");

    const voices = window.speechSynthesis.getVoices();
    addStatus(`Found ${voices.length} voices`);

    const utterance = new SpeechSynthesisUtterance("Hello! If you can hear this, text to speech is working.");
    utterance.onstart = () => addStatus("🔊 Speaking...");
    utterance.onend = () => addStatus("✅ Speech finished");
    utterance.onerror = (e) => addStatus(`❌ Speech error: ${e.error}`);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Voice Diagnostics</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={testMicrophone}
          className="px-4 py-2 bg-blue-500 rounded mr-4 hover:bg-blue-600"
        >
          1. Test Microphone
        </button>

        <button
          onClick={testSpeechRecognition}
          className="px-4 py-2 bg-green-500 rounded mr-4 hover:bg-green-600"
          disabled={isListening}
        >
          {isListening ? "Listening..." : "2. Test Speech Recognition"}
        </button>

        <button
          onClick={testSpeechSynthesis}
          className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
        >
          3. Test Text-to-Speech
        </button>
      </div>

      {transcript && (
        <div className="mb-6 p-4 bg-green-500/20 rounded">
          <p className="font-semibold">Last transcript:</p>
          <p>{transcript}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded p-4 max-h-96 overflow-y-auto">
        <p className="font-semibold mb-2">Status Log:</p>
        {status.length === 0 ? (
          <p className="text-gray-400">Click the buttons above to test</p>
        ) : (
          status.map((s, i) => (
            <p key={i} className="text-sm font-mono">{s}</p>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-500/20 rounded">
        <p className="font-semibold mb-2">Troubleshooting:</p>
        <ul className="text-sm space-y-1">
          <li>• Use <strong>Google Chrome</strong> (other browsers have limited support)</li>
          <li>• Allow microphone permission when prompted</li>
          <li>• If blocked, click 🔒 in URL bar → Site settings → Allow microphone</li>
          <li>• Make sure your microphone is connected and working</li>
          <li>• localhost should work without HTTPS</li>
        </ul>
      </div>
    </div>
  );
}
