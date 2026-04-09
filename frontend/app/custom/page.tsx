"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Play, Type, Info, AlertCircle, CheckCircle, BookOpen, Wand2, Zap } from 'lucide-react';
import { transliterate } from '../utils/transliterate';
import { inferCustomMeaning } from '../utils/meaning';
import { PalmLeavesBackground, CarvingText, PalmLeafFrame, CarvingLine } from '../components/PalmLeavesCarving';
import { validateIAST, getExamples, getErrorMessage, getIASTTip } from '../utils/iast-validation';

export default function CustomPracticePage() {
    const [englishText, setEnglishText] = useState('');
    const [validation, setValidation] = useState<{
        isValid: boolean;
        hasUnsupported: boolean;
        unsupportedChars: string[];
        warnings: string[];
    }>({ isValid: true, hasUnsupported: false, unsupportedChars: [], warnings: [] });
    const [showExamples, setShowExamples] = useState(true);
    const [currentTip, setCurrentTip] = useState('');
    const router = useRouter();
    
    const sanskritText = transliterate(englishText);
    const customMeaning = englishText.trim() ? inferCustomMeaning(englishText) : '';
    const examples = getExamples(englishText);

    // Validate IAST input in real-time
    useEffect(() => {
        const newValidation = validateIAST(englishText);
        setValidation(newValidation);
    }, [englishText]);

    // Set initial tip
    useEffect(() => {
        setCurrentTip(getIASTTip());
    }, []);

    // Keyboard shortcut: Ctrl+Enter to start practice
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && englishText.trim() && validation.isValid) {
                handleStartPractice();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [englishText, validation]);

    const handleStartPractice = () => {
        if (!englishText.trim() || !validation.isValid) return;

        const meaning = customMeaning || inferCustomMeaning(englishText);
        const customShlokaText = transliterate(englishText);

        const params = new URLSearchParams({
            customText: customShlokaText,
            customIAST: englishText,
            customMeaning: meaning,
            isCustom: 'true'
        });

        router.push(`/?${params.toString()}`);
    };

    const handleExampleClick = (example: string) => {
        setEnglishText(example);
        setShowExamples(false);
    };

    return (
        <PalmLeavesBackground>
            <div className="relative z-10 p-6 lg:p-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <header className="mb-12 flex justify-between items-center">
                        <Link 
                            href="/" 
                            className="flex items-center gap-2 group text-amber-900/70 hover:text-amber-900 transition-colors"
                            aria-label="Go back to library"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Library</span>
                        </Link>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/10 border border-amber-900/20">
                            <Sparkles className="w-4 h-4 text-amber-700" />
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-700/80">Ancient Manuscript</span>
                        </div>
                    </header>

                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-4 font-display text-amber-950" style={{ textShadow: '2px 2px 4px rgba(139, 90, 43, 0.1)' }}>
                            Carve Your Shloka
                        </h1>
                        <p className="text-amber-900 text-lg max-w-2xl mx-auto leading-relaxed">
                            Type your verse in English (IAST format) and watch it manifest as divine Devanagari<br />
                            <span className="text-amber-800/80 text-base">carved into ancient palm leaves</span>
                        </p>
                    </div>

                    {/* Main Layout - Two Column */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Input Section - Left Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Input Card */}
                            <div className="section-card bg-gradient-to-br from-amber-50/80 to-amber-50/60 border-amber-900/20 shadow-lg" style={{ boxShadow: '0 6px 24px rgba(139, 90, 43, 0.12), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
                                <div className="section-header">
                                    <Type className="w-6 h-6 text-amber-900/80" />
                                    <h2 className="section-title text-lg text-amber-950 font-display">English Phonetics (IAST)</h2>
                                </div>

                                <textarea
                                    value={englishText}
                                    onChange={(e) => setEnglishText(e.target.value)}
                                    placeholder="Try: om namah shivaya"
                                    className={`form-input w-full h-48 resize-none ${!validation.isValid ? 'form-input-error' : ''} bg-amber-50/90 text-amber-950 placeholder:text-amber-700/35 font-serif`}
                                    style={{ borderColor: 'rgba(139, 90, 43, 0.25)', lineHeight: '1.8' }}
                                    aria-label="Enter Sanskrit text in IAST format"
                                    aria-describedby="iast-help"
                                />

                                {/* Validation Feedback */}
                                {englishText.trim() && !validation.isValid && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="error-message"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{getErrorMessage(validation)}</span>
                                    </motion.div>
                                )}

                                {englishText.trim() && validation.isValid && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="success-message"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Valid IAST format ✓</span>
                                    </motion.div>
                                )}

                                {/* Help Info */}
                                <div className="info-box mt-4">
                                    <Info className="w-4 h-4 text-amber-900/50 mt-0.5 shrink-0" />
                                    <div className="info-text" id="iast-help">
                                        <p className="font-semibold text-amber-900/70 mb-1">IAST Quick Guide:</p>
                                        <p>Long vowels: ā, ī, ū • Retroflex: ṭ, ḍ, ṇ, ṛ • Palatals: ś, ñ • Sibilant: ṣ</p>
                                    </div>
                                </div>

                                {/* Keyboard Shortcut Hint */}
                                <p className="text-xs text-amber-900/40 mt-3 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Tip: Press <kbd className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 mx-1 text-xs font-mono">Ctrl+Enter</kbd> to start
                                </p>
                            </div>

                            {/* Examples Section */}
                            {showExamples && englishText === '' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="section-card"
                                >
                                    <div className="section-header">
                                        <Wand2 className="w-5 h-5 text-amber-800" />
                                        <h3 className="section-title">Try These Classics</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'om namah shivaya',
                                            'om mani padme hum',
                                            'asato ma sad gamaya',
                                            'tat tvam asi'
                                        ].map((example) => (
                                            <button
                                                key={example}
                                                onClick={() => handleExampleClick(example)}
                                                className="example-pill"
                                                aria-label={`Use example: ${example}`}
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-amber-900/50 mt-4">Click any example to start exploring!</p>
                                </motion.div>
                            )}

                            {/* Matching Examples */}
                            {examples.length > 0 && englishText.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="section-card bg-gradient-to-br from-amber-50/60 to-amber-50/40 border-amber-900/15" style={{ boxShadow: '0 4px 12px rgba(139, 90, 43, 0.08)' }}
                                >
                                    <p className="section-label text-amber-950">Related Examples</p>
                                    <div className="space-y-2">
                                        {examples.slice(0, 2).map((ex, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleExampleClick(ex.text)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-amber-50/70 transition-colors group border border-amber-900/15"
                                            >
                                                <p className="font-medium text-sm text-amber-950 group-hover:text-amber-900">{ex.text}</p>
                                                <p className="text-xs text-amber-900/70 mt-1">{ex.meaning}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Preview Section - Right Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <PalmLeafFrame animated>
                                <div className="space-y-6">
                                    {/* Devanagari Preview */}
                                    <div>
                                        <p className="section-label text-amber-950">Manifested Script</p>
                                        <div className="min-h-40 flex items-center justify-center">
                                            {sanskritText ? (
                                                <CarvingText
                                                    text={sanskritText}
                                                    className="devanagari-text text-4xl lg:text-5xl text-amber-950 text-center leading-relaxed"
                                                />
                                            ) : (
                                                <p className="text-amber-900/40 italic text-center text-sm">
                                                    The divine script will unfold here...
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {sanskritText && <CarvingLine show={true} />}

                                    {/* Meaning Display */}
                                    {customMeaning && (
                                        <div className="space-y-2 pt-2">
                                            <p className="section-label text-amber-950">Meaning & Intent</p>
                                            <div className="bg-gradient-to-br from-amber-50/70 to-amber-50/50 rounded-lg p-4 border border-amber-900/15" style={{ boxShadow: '0 2px 8px rgba(139, 90, 43, 0.08)' }}>
                                                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                                                    {customMeaning}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <motion.button
                                        onClick={handleStartPractice}
                                        disabled={!englishText.trim() || !validation.isValid}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full mt-6 py-4 rounded-lg font-semibold bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-amber-50 hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none aria-disabled:pointer-events-none"
                                        style={{ boxShadow: '0 4px 16px rgba(139, 90, 43, 0.3)' }}
                                        aria-label="Begin recitation practice"
                                        aria-disabled={!englishText.trim() || !validation.isValid}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <Play className="w-4 h-4 fill-current" />
                                            Begin Recitation
                                        </span>
                                    </motion.button>
                                </div>
                            </PalmLeafFrame>
                        </motion.div>
                    </div>

                    {/* Full-Width Interpretation Card */}
                    {englishText.trim() && customMeaning && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="section-card border-amber-900/20 bg-gradient-to-br from-amber-50/60 to-amber-50/40" style={{ boxShadow: '0 6px 24px rgba(139, 90, 43, 0.1)' }}
                        >
                            <div className="section-header">
                                <BookOpen className="w-6 h-6 text-amber-900/80" />
                                <h3 className="section-title text-lg text-amber-950 font-display">Deep Dive: Interpretation</h3>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50/60 to-white/50 rounded-lg p-6 border border-amber-900/15 space-y-4">
                                <div>
                                    <p className="font-semibold text-amber-950 mb-2">English Phonetics (IAST):</p>
                                    <p className="text-amber-900 font-mono text-sm bg-amber-50/80 rounded p-3 border border-amber-900/10" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
                                        {englishText}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-amber-950 mb-2">Devanagari Script:</p>
                                    <p className="devanagari-text text-3xl text-amber-950 bg-amber-50/80 rounded p-4 border border-amber-900/10 text-center" style={{ lineHeight: '2' }}>
                                        {sanskritText}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-amber-950 mb-2">Meaning & Significance:</p>
                                    <p className="text-amber-900/85 leading-relaxed">
                                        {customMeaning}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Accessibility SR-only text */}
                    <div className="sr-only" role="region" aria-live="polite" aria-label="Validation status">
                        {!validation.isValid && `Input has ${validation.unsupportedChars.length} unsupported characters`}
                        {validation.isValid && englishText.trim() && 'Input is valid'}
                    </div>
                </div>
            </div>
        </PalmLeavesBackground>
    );
}
