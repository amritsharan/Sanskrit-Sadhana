"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Play, Type, Info, Wand2 } from 'lucide-react';
import { transliterate } from '../utils/transliterate';

export default function CustomPracticePage() {
    const [englishText, setEnglishText] = useState('');
    const [sanskritText, setSanskritText] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Automatically transliterate whenever englishText changes
        setSanskritText(transliterate(englishText));
    }, [englishText]);

    const handleStartPractice = () => {
        if (!englishText.trim()) return;

        // Encode the content to pass to the Studio
        const params = new URLSearchParams({
            customText: sanskritText,
            customIAST: englishText,
            isCustom: 'true'
        });

        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-12 relative overflow-hidden">
            {/* Background Gradient Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-saffron-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold-600/5 blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Library</span>
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Sparkles className="w-4 h-4 text-gold-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gold-500/80">AI Transliteration</span>
                    </div>
                </header>

                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-display text-gradient">Custom Practice</h1>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto">
                        Type your shloka in English (IAST format) and watch it manifest in divine Devanagari.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Input Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 rounded-3xl border border-white/10 saffron-glow-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-saffron-500/10 flex items-center justify-center">
                                <Type className="w-5 h-5 text-saffron-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">English (IAST)</h3>
                                <p className="text-xs text-white/40">Enter phonetic text</p>
                            </div>
                        </div>

                        <textarea
                            value={englishText}
                            onChange={(e) => setEnglishText(e.target.value)}
                            placeholder="Try: om namah shivaya"
                            className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-medium placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-saffron-500/50 resize-none transition-all"
                        />

                        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <Info className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                            <p className="text-xs text-white/40 leading-relaxed">
                                Tip: Use standard IAST mapping. For example, 'ā' or 'aa' for long A, 'sh' for ś, etc.
                            </p>
                        </div>
                    </motion.div>

                    {/* Preview Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 rounded-3xl border border-white/10 gold-glow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Wand2 className="w-32 h-32" />
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-gold-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gold-500">Devanagari</h3>
                                <p className="text-xs text-white/40">Manifested glyphs</p>
                            </div>
                        </div>

                        <div className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center text-center overflow-hidden">
                            {sanskritText ? (
                                <p className="text-4xl font-serif text-white/90 leading-relaxed animate-in fade-in zoom-in duration-500">
                                    {sanskritText}
                                </p>
                            ) : (
                                <p className="text-white/20 italic">The divine script will appear here...</p>
                            )}
                        </div>

                        <button
                            onClick={handleStartPractice}
                            disabled={!englishText.trim()}
                            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-saffron-600 to-gold-600 text-white font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 shadow-lg shadow-saffron-500/20"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Start Practice Session</span>
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
