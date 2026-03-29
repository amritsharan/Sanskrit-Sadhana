"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, Square, RefreshCw, Volume2, Search, ArrowRight,
    Award, History, Info, Sparkles, LogOut, LogIn,
    ChevronLeft, ChevronRight, Activity, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHLOKAS, Shloka } from './data/shlokas';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from './utils/cn';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from "./components/ThemeToggle";

export default function Studio() {
    const [selectedShloka, setSelectedShloka] = useState<Shloka | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    // Pagination & Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, logout } = useAuth();

    const [showHistory, setShowHistory] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

    // Handle custom shloka from query params
    useEffect(() => {
        const customText = searchParams.get('customText');
        const customIAST = searchParams.get('customIAST');
        const isCustom = searchParams.get('isCustom');

        if (customText) {
            setSelectedShloka({
                id: 'custom',
                title: isCustom ? 'Custom Practice' : 'Imported Shloka',
                source: isCustom ? 'Direct Input' : 'External Link',
                text: customText,
                transliteration: customIAST || '',
                meaning: 'A custom shloka for focused phonetic refinement.'
            });
        } else if (SHLOKAS.length > 0 && !selectedShloka) {
            setSelectedShloka(SHLOKAS[0]);
        }
    }, [searchParams]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = () => {
                if (!audioChunks.current.length) {
                    setAudioError('No audio was recorded. Please try again.');
                    setAudioBlob(null);
                    setAudioUrl(null);
                    return;
                }
                try {
                    const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
                    setAudioBlob(blob);
                    setAudioUrl(URL.createObjectURL(blob));
                    setAudioError(null);
                } catch (err) {
                    setAudioError('Failed to process recorded audio.');
                    setAudioBlob(null);
                    setAudioUrl(null);
                }
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            setResults(null);
            setAudioError(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setAudioError("Unable to access microphone. Please check your permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const playReference = async (url: string) => {
        setAudioError(null);
        try {
            const audio = new Audio(url);
            // Preload to check if it's supported
            audio.addEventListener('error', (e) => {
                console.error("Audio Load Error:", e);
                setAudioError("Failed to load audio source. The link might be broken or unsupported.");
            });
            await audio.play();
        } catch (err: any) {
            console.error("Playback failed:", err);
            if (err.name === 'NotSupportedError') {
                setAudioError("The audio format or source is not supported by your browser.");
            } else if (err.name === 'NotAllowedError') {
                setAudioError("Playback was blocked by the browser. Please interact with the page first.");
            } else {
                setAudioError("An unexpected error occurred during playback.");
            }
        }
    };

    const analyzePronunciation = async () => {
        if (!audioBlob || !selectedShloka) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('shloka_text', selectedShloka.text);

        try {
            const response = await fetch(`${apiBaseUrl}/analyze`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setResults({
                ...data,
                score: data.score ?? data.analysis?.score ?? 0,
            });
        } catch (err) {
            console.error("Analysis failed:", err);
            setAudioError("Failed to connect to the analysis server. Please ensure the backend is running.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 relative"
            >
                <div className="absolute top-0 right-0 flex items-center gap-3">
                    <ThemeToggle />
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="flex items-center gap-3 glass px-4 py-2 rounded-full border-white/10 hover:border-primary/30 transition-all"
                            >
                                <span className="text-sm font-medium text-white/70">{user.name}</span>
                                <History className="w-4 h-4 text-primary/60" />
                            </button>

                            <AnimatePresence>
                                {showHistory && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-64 glass rounded-2xl p-4 border-white/10 z-50 shadow-2xl"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Login History</h4>
                                            <button onClick={logout} className="p-1.5 hover:bg-red-500/10 rounded-lg group">
                                                <LogOut className="w-3.5 h-3.5 text-white/30 group-hover:text-red-400 transition-colors" />
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                            {user.loginHistory?.map((time, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[11px] text-white/60 p-2 rounded-lg bg-white/5">
                                                    <Clock className="w-3 h-3 text-gold-500/50" />
                                                    {time}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={() => router.push('/login')} className="btn btn-secondary py-2 px-4 text-sm flex items-center gap-2">
                                <LogIn className="w-4 h-4" /> Sign In
                            </button>
                        </div>
                    )}
                </div>
                <h1 className="text-5xl font-bold mb-4">
                    Sanskrita <span className="text-gradient">Sadhana</span>
                </h1>
                <p className="text-muted-foreground text-lg">Master the divine sounds with AI-guided precision.</p>
                <Link href="/custom" className="inline-flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group">
                    Custom Practice Mode <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shloka Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Select Passage</h2>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-[10px] uppercase font-bold text-primary/60 tracking-tighter">Live Library</span>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search shlokas..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    </div>

                    <div className="space-y-2 min-h-[500px]">
                        {(() => {
                            const filtered = SHLOKAS.filter(s =>
                                s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                s.source.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            const lastIndex = currentPage * itemsPerPage;
                            const firstIndex = lastIndex - itemsPerPage;
                            const currentShlokas = filtered.slice(firstIndex, lastIndex);
                            const totalPages = Math.ceil(filtered.length / itemsPerPage);

                            return (
                                <>
                                    {currentShlokas.map((shloka) => (
                                        <button
                                            key={shloka.id}
                                            onClick={() => {
                                                setSelectedShloka(shloka);
                                                setResults(null);
                                                setAudioBlob(null);
                                                setAudioError(null);
                                            }}
                                            className={cn(
                                                "w-full text-left p-4 rounded-xl transition-all duration-300 glass hover:border-primary/50",
                                                selectedShloka?.id === shloka.id ? "border-primary saffron-glow bg-primary/5" : "hover:bg-white/5"
                                            )}
                                        >
                                            <h3 className="font-medium">{shloka.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">{shloka.source}</p>
                                        </button>
                                    ))}

                                    <div className="flex items-center justify-between pt-4 mt-auto">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="p-2 rounded-lg glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                            Page {currentPage} of {totalPages || 1}
                                        </span>
                                        <button
                                            disabled={currentPage >= totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="p-2 rounded-lg glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Practice Studio */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedShloka ? (
                        <motion.div
                            key={selectedShloka.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-2xl p-8 saffron-glow border-primary/20 relative overflow-hidden"
                        >
                            {/* Background Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <div className="relative z-10 px-4">
                                <div className="text-center mb-8">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Devanagari</span>
                                    <p className="text-3xl font-serif leading-relaxed mb-6">{selectedShloka.text}</p>
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mb-6"></div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Transliteration</span>
                                    <p className="text-xl italic text-muted-foreground">{selectedShloka.transliteration}</p>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex items-center gap-6 mb-2">
                                        {selectedShloka.audioUrl && (
                                            <button
                                                onClick={() => playReference(selectedShloka.audioUrl!)}
                                                className="flex flex-col items-center gap-2 group"
                                            >
                                                <div className="w-14 h-14 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition-colors group-hover:scale-110">
                                                    <Volume2 className="w-6 h-6 text-primary" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Reference</span>
                                            </button>
                                        )}

                                        <div className="flex flex-col items-center gap-2">
                                            {!isRecording ? (
                                                <button
                                                    onClick={startRecording}
                                                    disabled={isAnalyzing}
                                                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform saffron-glow elevation-xl"
                                                >
                                                    <Mic className="w-8 h-8 text-white" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={stopRecording}
                                                    className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-pulse elevation-xl shadow-red-500/50"
                                                >
                                                    <Square className="w-8 h-8 text-white" />
                                                </button>
                                            )}
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{isRecording ? "Stop" : "Record"}</span>
                                        </div>
                                    </div>

                                    {audioError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
                                        >
                                            <Info className="w-4 h-4" />
                                            {audioError}
                                        </motion.div>
                                    )}

                                    {audioBlob && !isRecording && (
                                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                                            <button
                                                onClick={analyzePronunciation}
                                                disabled={isAnalyzing}
                                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold hover:scale-105 transition-transform gold-glow disabled:opacity-50"
                                            >
                                                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                                                {isAnalyzing ? "Analyzing..." : "Analyze Now"}
                                            </button>
                                            {audioUrl && (
                                                <audio src={audioUrl} controls className="h-10 opacity-50 hover:opacity-100 transition-opacity" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-[400px] flex items-center justify-center glass rounded-2xl border-white/5">
                            <p className="text-muted-foreground italic">Select a verse to begin your sadhana.</p>
                        </div>
                    )}

                    {/* Results Display */}
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 animate-in zoom-in-95 duration-500"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Score Card */}
                                <div className="glass rounded-2xl p-6 border-white/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-colors"></div>
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-accent" />
                                        Pronunciation Score
                                    </h3>
                                    <div className="flex items-end gap-3 mb-6">
                                        <span className="text-6xl font-black text-gradient leading-none">
                                            {results.score}
                                        </span>
                                        <span className="text-xl font-bold text-white/20 mb-1">/ 100</span>
                                    </div>
                                    <p className="text-sm text-white/50 leading-relaxed font-medium">
                                        {results.score >= 90 ? "Divine! Your pronunciation matches the ancient standards." :
                                            results.score >= 75 ? "Sublime effort. Focus on the subtle nasalization." :
                                                "Maintain steady breath and clear articulation."}
                                    </p>
                                </div>

                                {/* Error Insights */}
                                <div className="glass rounded-2xl p-6 border-white/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
                                    <h3 className="text-lg font-semibold mb-4 relative z-10 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-secondary" />
                                        Phonetic Insights
                                    </h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 relative z-10 custom-scrollbar">
                                        {results.analysis.errors.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                                                    <Award className="w-6 h-6 text-accent" />
                                                </div>
                                                <p className="text-accent font-medium uppercase tracking-widest text-[10px]">Perfection Achieved</p>
                                                <p className="text-sm text-white/50 mt-1">No significant errors detected!</p>
                                            </div>
                                        ) : (
                                            results.analysis.errors.map((err: any, idx: number) => (
                                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-red-400">{idx + 1}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white/90">{err.description}</p>
                                                        <div className="flex items-center gap-2 mt-2 py-1 px-3 rounded-md bg-white/5 w-fit border border-white/5">
                                                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Expected</span>
                                                            <span className="text-sm font-mono text-accent">"{err.ref_ph}"</span>
                                                            <div className="h-3 w-[1px] bg-white/10 mx-1"></div>
                                                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Heard</span>
                                                            <span className="text-sm font-mono text-red-400">"{err.hyp_ph || '∅'}"</span>
                                                        </div>
                                                        <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">At position {err.ref_idx + 1}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
