# Voice Recording Feature Guide

## Overview
The Sensr AI app now includes a voice recording feature that simulates a real interview experience. Users can speak their answers naturally, and the app will transcribe them in real-time using the Web Speech API.

## Features

### Mode Toggle
- **Type Mode**: Traditional text input via textarea (default)
- **Record Mode**: Voice recording with live transcription
- Seamless switching between modes with smooth animations
- Answer persists when switching modes

### Voice Recording Capabilities

#### Recording Interface
- **Large Circular Microphone Button**:
  - Purple gradient when idle
  - Red when recording
  - Pulsing animation while recording
  - Stop recording by clicking again

#### Real-Time Feedback
- **Recording Timer**: Shows elapsed time in MM:SS format
- **Audio Level Indicator**: Visual bars that react to voice volume
- **Live Transcription**: Text appears as you speak
  - Final text in white
  - Interim text (processing) in gray italic
  - Editable after recording stops

#### Visual Effects
- Pulsing rings emanate from microphone during recording
- Recording status indicator (red dot)
- Smooth transitions between states
- Premium dark UI with glass morphism

### Browser Compatibility

#### Supported Browsers
- ✅ Chrome/Edge (Chromium-based) - Full support
- ✅ Safari - Full support
- ❌ Firefox - Limited/No support

The app automatically detects browser support and displays a helpful message if Web Speech API is unavailable.

### Error Handling
- Microphone permission requests
- No speech detection warnings
- Permission denied notifications
- Network/API error messages
- Automatic recovery for temporary interruptions

## User Flow

1. **Select Record Mode**: Click the "Record" button in the mode toggle
2. **Start Recording**: Click the large microphone button
3. **Speak Your Answer**: The transcription appears in real-time below
4. **Monitor Progress**: Watch the timer and audio level indicators
5. **Stop Recording**: Click the stop button (square icon)
6. **Review Transcript**: Edit if needed in the live transcript area
7. **Submit**: Click "Submit for Review" when satisfied

## Technical Details

### Implementation
- **Component**: `/components/VoiceRecorder.tsx`
- **API**: Web Speech API (SpeechRecognition)
- **Audio Visualization**: Web Audio API (AudioContext, AnalyserNode)
- **State Management**: React hooks with real-time updates

### Key Features
```typescript
// Real-time transcription
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

// Audio level monitoring
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
```

### Animations
- Framer Motion for smooth transitions
- Pulsing rings sync with audio levels
- Mode switching with slide animations
- Recording button scale and color transitions

## Design Language
The voice recording feature maintains the app's premium aesthetic:
- **Glass Morphism**: Frosted glass effect on panels
- **Purple Accents**: Consistent with brand colors
- **Smooth Animations**: Framer Motion throughout
- **Lucide Icons**: Matching existing icon set
- **Dark Theme**: Premium dark background with high contrast

## Tips for Best Experience

### For Users
1. **Use Chrome or Safari** for best compatibility
2. **Allow microphone permissions** when prompted
3. **Speak clearly** at a normal pace
4. **Wait for silence** before stopping to ensure all words are captured
5. **Review transcript** before submitting (you can edit it)

### For Developers
1. **Test in multiple browsers** - behavior varies
2. **Handle permissions gracefully** - some users may deny access
3. **Provide fallbacks** - always keep typing mode available
4. **Monitor audio context** - cleanup is important for memory
5. **Test error scenarios** - network issues, no speech, etc.

## Future Enhancements
Potential improvements for future versions:
- Support for multiple languages
- Pause/resume recording
- Playback of recorded audio
- Download transcript as text file
- Sentiment analysis during recording
- Practice mode with suggested pacing
- Integration with interview coaching tips

## Troubleshooting

### Microphone Not Working
1. Check browser permissions in settings
2. Ensure microphone is connected and working
3. Try refreshing the page
4. Switch to a supported browser

### Transcription Issues
1. Speak more clearly and at a moderate pace
2. Reduce background noise
3. Check microphone input levels in system settings
4. Try a different browser

### Performance Issues
1. Close other tabs using microphone
2. Disable browser extensions
3. Check system resources
4. Use a wired internet connection for better reliability

## Accessibility
- Keyboard navigation supported (Tab to focus, Enter to activate)
- ARIA labels for screen readers
- Visual feedback for all states
- Error messages are clearly communicated
- Mode toggle is clearly labeled

## Privacy & Security
- **No Audio Storage**: Audio is processed locally in the browser
- **No Server Upload**: Transcription happens client-side
- **Secure API**: Only text transcript is sent to evaluation endpoint
- **User Control**: Users can clear transcripts at any time
- **Permission Based**: Requires explicit microphone permission

---

**Note**: This feature requires a modern browser with Web Speech API support. For the best experience, use Chrome, Edge, or Safari on desktop or mobile devices.
