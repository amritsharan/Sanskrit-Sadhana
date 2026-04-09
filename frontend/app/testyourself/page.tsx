'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Mic2,
  Brain,
  Zap,
  Award,
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';
import { GuruMode } from '../components/GuruMode';

interface SessionStats {
  correctAnswers: number;
  totalQuestions: number;
  averageScore: number;
  currentStreak: number;
}

type Screen = 'home' | 'guru' | 'summary';

export default function TestYourselfPage() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sessionMode, setSessionMode] = useState<'test' | 'practice'>('practice');
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const router = useRouter();

  const handleStartSession = (mode: 'test' | 'practice') => {
    setSessionMode(mode);
    setScreen('guru');
  };

  const handleSessionEnd = (stats: SessionStats) => {
    setSessionStats(stats);
    setScreen('summary');
  };

  const handleBackToHome = () => {
    setScreen('home');
    setSessionStats(null);
  };

  if (screen === 'guru' && sessionStats === null) {
    return (
      <GuruMode
        initialMode={sessionMode}
        onExit={handleSessionEnd}
      />
    );
  }

  if (screen === 'summary' && sessionStats) {
    return (
      <SessionSummary
        stats={sessionStats}
        mode={sessionMode}
        onContinue={() => handleStartSession(sessionMode)}
        onReturn={handleBackToHome}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-amber-50 to-white">
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(180, 140, 80, 0.08) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(160, 120, 70, 0.08) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(140, 100, 60, 0.08) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(120, 80, 40, 0.08) 75%)
            `,
            backgroundSize: '60px 60px',
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-amber-900/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 group text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-3xl font-bold text-amber-950 flex items-center gap-3">
            <Mic2 className="w-8 h-8" />
            Test Yourself
          </h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-amber-950 mb-4">
            Interactive Guru-Sishya Learning
          </h2>
          <p className="text-lg text-amber-900/80 max-w-3xl mx-auto">
            Engage in a live conversation with your Guru. Test your Sanskrit knowledge and
            pronunciation through voice-based interaction. Switch between Test and Practice modes
            based on your learning pace.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: Mic2,
              title: 'Voice Interaction',
              description: 'Speak Sanskrit naturally with real-time recognition',
              color: 'from-red-500 to-red-600',
            },
            {
              icon: Brain,
              title: 'Smart Feedback',
              description: 'Get personalized guidance from your Guru',
              color: 'from-purple-500 to-purple-600',
            },
            {
              icon: Zap,
              title: 'Adaptive Learning',
              description: 'Questions adjust to your difficulty level',
              color: 'from-yellow-500 to-yellow-600',
            },
            {
              icon: Award,
              title: 'Track Progress',
              description: 'Monitor your performance and improvement',
              color: 'from-green-500 to-green-600',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-white/80 backdrop-blur rounded-lg p-6 border border-amber-900/10 shadow-md hover:shadow-lg transition-shadow"
            >
              <feature.icon className={`w-8 h-8 mb-3 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
              <h3 className="font-semibold text-amber-950 mb-2">{feature.title}</h3>
              <p className="text-sm text-amber-900/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Test Yourself */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg p-8 border-2 border-blue-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-950">Test Yourself</h3>
            </div>

            <p className="text-blue-900 mb-4 leading-relaxed">
              Challenge yourself in an exam-like mode. Your Guru will ask progressively harder
              questions. Receive formal evaluations and corrections.
            </p>

            <ul className="space-y-2 mb-6 text-sm text-blue-900/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Progressive difficulty levels
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Formal feedback and scoring
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Track mastery achievement
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Can switch to Practice anytime
              </li>
            </ul>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStartSession('test')}
              className="w-full px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              Start Test Mode
            </motion.button>
          </motion.div>

          {/* Practice Mode */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-lg p-8 border-2 border-emerald-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-emerald-100">
                <Mic2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-950">Practice Mode</h3>
            </div>

            <p className="text-emerald-900 mb-4 leading-relaxed">
              Learn at your own pace in a supportive environment. Your Guru will provide
              encouraging guidance as you build confidence and pronunciation skills.
            </p>

            <ul className="space-y-2 mb-6 text-sm text-emerald-900/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Supportive learning environment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Focus on improvement, not scores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Learn practical Sanskrit usage
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Can switch to Test anytime
              </li>
            </ul>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStartSession('practice')}
              className="w-full px-6 py-3 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              Start Practice Mode
            </motion.button>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-100/50 backdrop-blur rounded-lg p-8 border border-amber-300"
        >
          <h3 className="font-bold text-amber-950 mb-4 text-lg">How It Works:</h3>
          <ol className="space-y-3 text-amber-900/90">
            <li className="flex gap-3">
              <span className="font-bold text-amber-700 flex-shrink-0">1.</span>
              <span>
                Your Guru presents a question in Sanskrit (Devanagari + IAST transliteration)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-amber-700 flex-shrink-0">2.</span>
              <span>
                Click "Start Recording" to speak your response. The system recognizes your speech.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-amber-700 flex-shrink-0">3.</span>
              <span>
                Your Guru evaluates your response, provides feedback on pronunciation and meaning.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-amber-700 flex-shrink-0">4.</span>
              <span>
                View your score and proceed to the next question. Switch between Test and Practice
                modes anytime.
              </span>
            </li>
          </ol>
        </motion.div>
      </main>
    </div>
  );
}

/**
 * Session Summary Component
 */
function SessionSummary({
  stats,
  mode,
  onContinue,
  onReturn,
}: {
  stats: SessionStats;
  mode: 'test' | 'practice';
  onContinue: () => void;
  onReturn: () => void;
}) {
  const successRate = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
  const isExcellent = successRate >= 80;
  const isGood = successRate >= 60;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <header className="relative z-10 border-b border-amber-900/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-amber-950">Session Complete! 🙏</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-12 text-center mb-8 border-2 shadow-lg ${
            isExcellent
              ? 'bg-gradient-to-br from-green-50 to-green-50/50 border-green-300'
              : isGood
                ? 'bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-300'
                : 'bg-gradient-to-br from-yellow-50 to-yellow-50/50 border-yellow-300'
          }`}
        >
          <div className="text-6xl mb-4">
            {isExcellent ? '🏆' : isGood ? '⭐' : '✨'}
          </div>
          <h2
            className={`text-4xl font-bold mb-2 ${
              isExcellent
                ? 'text-green-900'
                : isGood
                  ? 'text-blue-900'
                  : 'text-yellow-900'
            }`}
          >
            {isExcellent ? 'Excellent!' : isGood ? 'Great Job!' : 'Good Effort!'}
          </h2>
          <p
            className={`text-lg ${
              isExcellent
                ? 'text-green-800'
                : isGood
                  ? 'text-blue-800'
                  : 'text-yellow-800'
            }`}
          >
            You've completed your {mode} session successfully
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/80 rounded-lg p-6 border border-amber-900/10 text-center">
            <p className="text-3xl font-bold text-amber-950">{stats.totalQuestions}</p>
            <p className="text-sm text-amber-900/60">Questions</p>
          </div>
          <div className="bg-white/80 rounded-lg p-6 border border-amber-900/10 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.correctAnswers}</p>
            <p className="text-sm text-amber-900/60">Correct</p>
          </div>
          <div className="bg-white/80 rounded-lg p-6 border border-amber-900/10 text-center">
            <p className="text-3xl font-bold text-blue-600">{successRate}%</p>
            <p className="text-sm text-amber-900/60">Success Rate</p>
          </div>
          <div className="bg-white/80 rounded-lg p-6 border border-amber-900/10 text-center">
            <p className="text-3xl font-bold text-amber-700">{stats.currentStreak} 🔥</p>
            <p className="text-sm text-amber-900/60">Current Streak</p>
          </div>
        </motion.div>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="px-8 py-3 rounded-lg font-semibold bg-amber-700 text-white hover:bg-amber-800"
          >
            Continue Learning
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReturn}
            className="px-8 py-3 rounded-lg font-semibold border-2 border-amber-700 text-amber-700 hover:bg-amber-50"
          >
            Return Home
          </motion.button>
        </div>
      </main>
    </div>
  );
}
