'use client';

import { useVoiceAssistant, useRoomContext } from '@livekit/components-react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Phone, MessageSquare, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { RoomEvent } from 'livekit-client';

interface ImprovSessionProps {
  onDisconnect: () => void;
  playerName: string;
}

interface TranscriptMessage {
  id: string;
  speaker: 'agent' | 'user';
  text: string;
  timestamp: Date;
}

export function ImprovSession({ onDisconnect, playerName }: ImprovSessionProps) {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const room = useRoomContext();
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const isConnected = state !== 'disconnected' && state !== 'idle';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  // Listen for agent transcriptions (what the agent says)
  useEffect(() => {
    if (!agentTranscriptions || agentTranscriptions.length === 0) return;
    
    const latestTranscription = agentTranscriptions[agentTranscriptions.length - 1];
    if (latestTranscription && latestTranscription.final) {
      const text = latestTranscription.text.trim();
      if (text) {
        setTranscript(prev => {
          // Avoid duplicates
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.text === text && lastMessage?.speaker === 'agent') {
            return prev;
          }
          
          return [
            ...prev,
            {
              id: `agent-${Date.now()}-${Math.random()}`,
              speaker: 'agent',
              text,
              timestamp: new Date(),
            }
          ];
        });
      }
    }
  }, [agentTranscriptions]);

  // Listen for user transcriptions (what the user says)
  useEffect(() => {
    if (!room) return;

    const handleTranscriptionReceived = (
      segments: any[],
      participant: any,
      publication: any
    ) => {
      // Only capture user's own transcriptions
      if (participant && !participant.isAgent) {
        segments.forEach((segment) => {
          if (segment.final && segment.text.trim()) {
            setTranscript(prev => {
              // Avoid duplicates
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.text === segment.text.trim() && lastMessage?.speaker === 'user') {
                return prev;
              }
              
              return [
                ...prev,
                {
                  id: `user-${Date.now()}-${Math.random()}`,
                  speaker: 'user',
                  text: segment.text.trim(),
                  timestamp: new Date(),
                }
              ];
            });
          }
        });
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscriptionReceived);

    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscriptionReceived);
    };
  }, [room]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (showTranscript) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, showTranscript]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Stage Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,255,0.15),transparent_70%)]" />
      
      {/* Spotlight Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500 rounded-full filter blur-[120px]"
          animate={{
            opacity: isSpeaking ? [0.3, 0.5, 0.3] : 0.2,
            scale: isSpeaking ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-[120px]"
          animate={{
            opacity: isListening ? [0.3, 0.5, 0.3] : 0.2,
            scale: isListening ? [1, 1.3, 1] : 1,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center p-8">
        {/* Player Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-8"
        >
          <div className="bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg px-6 py-3">
            <p className="text-sm text-gray-400">Contestant</p>
            <p className="text-xl font-bold text-pink-400">{playerName}</p>
          </div>
        </motion.div>

        {/* Transcript Toggle Button */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTranscript(!showTranscript)}
          className="absolute top-8 right-8 bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 hover:border-purple-400 rounded-lg px-4 py-3 transition-all duration-300 flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-semibold">Transcript</span>
          {transcript.length > 0 && (
            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {transcript.length}
            </span>
          )}
        </motion.button>

        {/* Transcript Panel */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full md:w-[500px] bg-black/95 backdrop-blur-xl border-l-2 border-purple-500/50 flex flex-col"
            >
              {/* Transcript Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
                <div>
                  <h3 className="text-2xl font-bold text-purple-400">Conversation</h3>
                  <p className="text-sm text-gray-400">Full transcript of your session</p>
                </div>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Transcript Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {transcript.length === 0 ? (
                  <div className="text-center text-gray-500 mt-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No messages yet...</p>
                    <p className="text-sm mt-2">Your conversation will appear here</p>
                  </div>
                ) : (
                  transcript.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.speaker === 'agent'
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-pink-500/20 border border-pink-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold ${
                              message.speaker === 'agent' ? 'text-purple-400' : 'text-pink-400'
                            }`}
                          >
                            {message.speaker === 'agent' ? '🎭 HOST' : `🎤 ${playerName.toUpperCase()}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>

              {/* Transcript Footer */}
              <div className="p-4 border-t border-purple-500/30 bg-black/50">
                <p className="text-xs text-gray-500 text-center">
                  💾 Transcript is saved for this session only
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 blur-2xl"
              animate={{
                backgroundColor: isSpeaking 
                  ? 'rgba(255, 0, 255, 0.4)' 
                  : isListening 
                  ? 'rgba(0, 255, 255, 0.4)' 
                  : 'rgba(128, 128, 128, 0.2)',
              }}
            />
            <div className="relative bg-black/80 backdrop-blur-sm p-12 rounded-full border-4 border-purple-500/50">
              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Mic className={`w-24 h-24 ${
                  isSpeaking ? 'text-pink-400' : 
                  isListening ? 'text-cyan-400' : 
                  'text-gray-500'
                }`} strokeWidth={2} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {isSpeaking ? '🎭 HOST IS SPEAKING' : 
             isListening ? '🎤 YOUR TURN!' : 
             isConnected ? '⏸️ READY' : '🔌 CONNECTING...'}
          </h2>
          <p className="text-gray-400 text-lg">
            {isSpeaking ? 'Listen to the host...' : 
             isListening ? 'Perform your improv!' : 
             isConnected ? 'Waiting for next cue...' : 
             'Connecting to the show...'}
          </p>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl bg-black/60 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6 mb-8"
        >
          <h3 className="text-yellow-400 font-bold mb-3 text-center">💡 HOW TO PLAY</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>🎬 Listen to the host present your scenario</li>
            <li>🎭 Perform your improv in character</li>
            <li>🎤 Say <span className="text-pink-400 font-bold">"end scene"</span> when you're done</li>
            <li>⭐ Get feedback from the host</li>
            <li>🔄 Complete 3 rounds total</li>
          </ul>
        </motion.div>

        {/* End Call Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDisconnect}
          className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 hover:border-red-500 text-red-400 font-bold px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3"
        >
          <Phone className="w-5 h-5" />
          END SHOW
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            Powered by <span className="text-pink-400 font-bold">Murf Falcon TTS</span> • Ultra-Fast Voice AI
          </p>
        </motion.div>
      </div>
    </div>
  );
}
