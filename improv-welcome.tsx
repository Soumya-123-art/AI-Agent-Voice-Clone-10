'use client';

import { Button } from '@/components/livekit/button';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Sparkles } from 'lucide-react';

interface ImprovWelcomeProps {
  onStartGame: (playerName: string) => void;
}

export const ImprovWelcome = ({ onStartGame }: ImprovWelcomeProps) => {
  const [playerName, setPlayerName] = useState('');
  const [particles, setParticles] = useState<Array<{x: number, y: number, targetX: number, targetY: number, duration: number}>>([]);
  
  useEffect(() => {
    const newParticles = [...Array(30)].map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
      targetX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      targetY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
      duration: 20 + Math.random() * 40,
    }));
    setParticles(newParticles);
  }, []);

  const handleStart = () => {
    if (playerName.trim()) {
      onStartGame(playerName.trim());
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Spotlight Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,255,0.1),transparent_50%)]" />
      
      {/* Stage Lights */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500 rounded-full filter blur-[100px] opacity-30"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-64 h-64 bg-pink-500 rounded-full filter blur-[100px] opacity-30"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: particle.x,
              y: particle.y,
            }}
            animate={{
              y: [null, particle.targetY],
              x: [null, particle.targetX],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        ))}
      </div>

      <section className="relative flex flex-col items-center justify-center text-center px-4 h-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl w-full"
        >
          {/* Stage Curtain Effect */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-gradient-to-b from-purple-900/20 to-transparent p-12 rounded-2xl border-2 border-purple-500/30 backdrop-blur-sm"
          >
            {/* Spotlight Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", bounce: 0.5 }}
              className="mb-6 inline-block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/40 blur-2xl rounded-full" />
                <div className="relative bg-black/90 p-6 rounded-full border-4 border-yellow-500/60">
                  <Mic className="w-16 h-16 text-yellow-400" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                IMPROV BATTLE
              </h1>
              <p className="text-2xl text-pink-400 font-bold mb-3 tracking-wide">
                🎭 THE VOICE IMPROV GAME SHOW 🎭
              </p>
              <p className="text-gray-300 max-w-lg mx-auto text-lg leading-relaxed mb-8">
                Step into the spotlight! Perform hilarious improv scenarios and get real-time reactions from your AI host!
              </p>
            </motion.div>

            {/* Name Input */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mb-6"
            >
              <label className="block text-yellow-400 font-bold mb-3 text-sm uppercase tracking-wider">
                Enter Your Stage Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                placeholder="Your Name"
                className="w-full max-w-md mx-auto px-6 py-4 bg-black/60 border-2 border-purple-500/50 rounded-lg text-white text-center text-xl font-bold placeholder-gray-500 focus:outline-none focus:border-pink-500/80 transition-all"
              />
            </motion.div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleStart}
                disabled={!playerName.trim()}
                className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-400 hover:to-pink-400 text-black font-black text-xl px-12 py-6 rounded-full shadow-lg shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                START IMPROV BATTLE!
              </Button>
            </motion.div>

            {/* Game Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-3 justify-center text-sm"
            >
              {[
                '🎬 3 Rounds',
                '🎭 Unique Scenarios',
                '⚡ Live Reactions',
                '🌟 Be Creative!'
              ].map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  className="px-4 py-2 bg-purple-900/40 border border-purple-500/40 rounded-full text-purple-200 font-semibold"
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8"
        >
          <p className="text-gray-500 text-sm">
            Powered by{' '}
            <span className="text-pink-400 font-bold">Murf Falcon TTS</span>
            {' '}• The Fastest Voice AI
          </p>
        </motion.div>
      </section>
    </div>
  );
};
