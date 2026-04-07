"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, Square, RefreshCw, Volume2, Search, ArrowRight,
    Award, History, Info, Sparkles, LogOut, LogIn,
    ChevronLeft, ChevronRight, Activity, Clock, Waves, Target, BookOpen, CheckCircle2, Download, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHLOKAS, Shloka } from './data/shlokas';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from './utils/cn';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from "./components/ThemeToggle";

interface AnalysisError {
    description: string;
    ref_ph: string | null;
    hyp_ph: string | null;
    ref_idx: number;
}

interface WordFeedback {
    word: string;
    word_index: number;
    issue_count: number;
    severity: 'low' | 'medium' | 'high';
}

interface WordMismatch {
    mismatch_type: 'replace' | 'delete' | 'insert';
    expected_word: string | null;
    pronounced_word: string | null;
    expected_index: number | null;
    pronounced_index: number | null;
}

type MismatchSeverity = 'low' | 'medium' | 'high';

interface AnalysisResult {
    score: number;
    matches: number;
    total_ref: number;
    errors: AnalysisError[];
    ref_mismatches?: number;
    op_counts?: {
        sub?: number;
        del?: number;
        ins?: number;
    };
    word_feedback?: WordFeedback[];
    word_mismatches?: WordMismatch[];
}

interface PronunciationResult {
    score: number;
    analysis: AnalysisResult;
    transcript?: string;
}

function getScoreSummary(score: number) {
    if (score >= 90) {
        return {
            label: "Excellent resonance",
            message: "Your chant is highly aligned. Most phonemes landed clearly with strong consistency.",
            badgeClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
            scoreClassName: "from-emerald-400 to-primary",
        };
    }

    if (score >= 75) {
        return {
            label: "Strong foundation",
            message: "The overall flow is good. A few phonemes or lengths need refinement for cleaner delivery.",
            badgeClassName: "border-amber-500/20 bg-amber-500/10 text-amber-300",
            scoreClassName: "from-gold-400 to-primary",
        };
    }

    return {
        label: "Needs guided refinement",
        message: "The system detected several pronunciation mismatches. Slow repetition and focused correction will help most.",
        badgeClassName: "border-rose-500/20 bg-rose-500/10 text-rose-300",
        scoreClassName: "from-rose-400 to-orange-500",
    };
}

function getScoreBreakdown(results: PronunciationResult | null) {
    const analysis = results?.analysis;
    const totalRef = analysis?.total_ref ?? 0;
    const matches = analysis?.matches ?? 0;
    const errors = analysis?.errors ?? [];
    const refMismatches = analysis?.ref_mismatches ?? Math.max(0, totalRef - matches);
    const extraSounds = analysis?.op_counts?.ins ?? 0;
    const alignment = totalRef > 0 ? Math.round((matches / totalRef) * 100) : 0;
    const consistency = Math.max(0, 100 - refMismatches * 6);
    const clarity = Math.max(0, Math.min(100, Math.round((results?.score ?? 0) * 0.85 + alignment * 0.15)));

    return { totalRef, matches, errors, refMismatches, extraSounds, alignment, consistency, clarity };
}

function MetricBar({ label, value, tone }: { label: string; value: number; tone: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                <span>{label}</span>
                <span className="text-foreground">{value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", tone)}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function InsightStat({
    title,
    value,
    caption,
    accentClassName,
}: {
    title: string;
    value: number;
    caption: string;
    accentClassName: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/10 p-5 min-h-[12.5rem] dark:bg-white/5">
            <div className={cn("absolute inset-x-4 top-0 h-px bg-gradient-to-r opacity-80", accentClassName)} />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground leading-5">
                {title}
            </p>
            <div className="mt-4 flex min-h-[5.5rem] items-center justify-center rounded-[1.35rem] border border-white/8 bg-white/5">
                <p className="text-3xl font-black">{value}</p>
            </div>
            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                {caption}
            </p>
        </div>
    );
}

function tokenizeTransliterationWords(text: string): string[] {
    return text
        .replace(/\n/g, ' ')
        .replace(/[|।॥]/g, ' ')
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);
}

function getSeverityClasses(severity: MismatchSeverity) {
    if (severity === 'high') {
        return {
            word: 'bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/40',
            item: 'border-rose-500/35 bg-rose-500/15 text-rose-100',
            badge: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
        };
    }

    if (severity === 'medium') {
        return {
            word: 'bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/40',
            item: 'border-amber-500/30 bg-amber-500/12 text-amber-100',
            badge: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
        };
    }

    return {
        word: 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/35',
        item: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
        badge: 'bg-sky-500/20 text-sky-200 border-sky-500/40',
    };
}

function getMismatchDefaultSeverity(mismatchType: WordMismatch['mismatch_type']): MismatchSeverity {
    if (mismatchType === 'delete') return 'high';
    if (mismatchType === 'replace') return 'medium';
    return 'low';
}

function getMismatchTooltipText(item: WordMismatch, severity: MismatchSeverity): string {
    if (item.mismatch_type === 'replace' && item.expected_word && item.pronounced_word) {
        return `Expected "${item.expected_word}", but heard "${item.pronounced_word}" (${severity} severity).`;
    }
    if (item.mismatch_type === 'delete' && item.expected_word) {
        return `Expected word "${item.expected_word}" was not detected in your recitation (${severity} severity).`;
    }
    if (item.mismatch_type === 'insert' && item.pronounced_word) {
        return `Extra spoken word "${item.pronounced_word}" is not part of the reference (${severity} severity).`;
    }
    return `Word-level mismatch detected (${severity} severity).`;
}

export default function Studio() {
    const [selectedShloka, setSelectedShloka] = useState<Shloka | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<PronunciationResult | null>(null);
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
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);
    const [insightPage, setInsightPage] = useState(1);
    const insightsPerPage = 4;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const scoreSummary = results ? getScoreSummary(results.score ?? 0) : null;
    const scoreBreakdown = results ? getScoreBreakdown(results) : null;
    const highlightedWordIndexes = new Set<number>([
        ...(results?.analysis?.word_feedback?.map((item) => item.word_index) ?? []),
        ...((results?.analysis?.word_mismatches ?? [])
            .map((item) => item.expected_index)
            .filter((idx): idx is number => typeof idx === 'number')),
    ]);
    const wordSeverityByIndex = new Map<number, MismatchSeverity>();
    (results?.analysis?.word_feedback ?? []).forEach((item) => {
        const existing = wordSeverityByIndex.get(item.word_index);
        if (existing === 'high') return;
        if (existing === 'medium' && item.severity === 'low') return;
        wordSeverityByIndex.set(item.word_index, item.severity);
    });

    (results?.analysis?.word_mismatches ?? []).forEach((item) => {
        if (typeof item.expected_index !== 'number') return;
        const existing = wordSeverityByIndex.get(item.expected_index);
        const fallback = getMismatchDefaultSeverity(item.mismatch_type);
        if (existing === 'high') return;
        if (existing === 'medium' && fallback === 'low') return;
        if (!existing || fallback === 'high' || (fallback === 'medium' && existing === 'low')) {
            wordSeverityByIndex.set(item.expected_index, fallback);
        }
    });

    const transliterationWords = tokenizeTransliterationWords(selectedShloka?.transliteration || '');

    useEffect(() => {
        setInsightPage(1);
    }, [results]);

    // Handle custom shloka from query params
    useEffect(() => {
        const customText = searchParams.get('customText');
        const customIAST = searchParams.get('customIAST');
        const customMeaning = searchParams.get('customMeaning');
        const isCustom = searchParams.get('isCustom');

        if (customText) {
            setSelectedShloka((current) => {
                if (
                    current?.id === 'custom' &&
                    current.text === customText &&
                    current.transliteration === (customIAST || '') &&
                    current.meaning === (customMeaning || '')
                ) {
                    return current;
                }

                return {
                    id: 'custom',
                    title: isCustom ? 'Custom Practice' : 'Imported Shloka',
                    source: isCustom ? 'Direct Input' : 'External Link',
                    reference: isCustom ? 'Self-composed Passage' : 'Imported Passage',
                    text: customText,
                    transliteration: customIAST || '',
                    meaning: customMeaning || 'A custom shloka for focused phonetic refinement.'
                };
            });
        } else if (SHLOKAS.length > 0) {
            setSelectedShloka((current) => current ?? SHLOKAS[0]);
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
                } catch {
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
            audio.preload = 'auto';
            // Preload to check if it's supported
            audio.addEventListener('error', (e) => {
                console.error("Audio Load Error:", e);
                setAudioError("Failed to load audio source. The link might be broken or unsupported.");
            });
            await audio.play();
        } catch (err: unknown) {
            console.error("Playback failed:", err);
            const errorName = err instanceof Error ? err.name : "";
            if (errorName === 'NotSupportedError') {
                setAudioError("The audio format or source is not supported by your browser.");
            } else if (errorName === 'NotAllowedError') {
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
        formData.append('ref_text', selectedShloka.transliteration || selectedShloka.text);

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

    const openReferenceAudio = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const downloadDetailedReport = async () => {
        if (!results || !selectedShloka || !scoreBreakdown || !scoreSummary) {
            return;
        }

        setIsDownloadingReport(true);

        try {
            const { jsPDF } = await import("jspdf");
            const pdf = new jsPDF({ unit: "pt", format: "a4" });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const marginX = 48;
            let cursorY = 56;

            const paintPageTheme = () => {
                pdf.setFillColor(18, 18, 18);
                pdf.rect(0, 0, pageWidth, pageHeight, "F");

                // Subtle brochure-style top accent band for visual consistency.
                pdf.setFillColor(35, 26, 20);
                pdf.rect(0, 0, pageWidth, 36, "F");

                pdf.setDrawColor(245, 158, 11);
                pdf.setLineWidth(0.6);
                pdf.line(marginX, 34, pageWidth - marginX, 34);
            };

            const toPdfReadableText = (value?: string | null) => {
                if (!value) return "";
                const ascii = value
                    .normalize("NFKD")
                    .replace(/[^\x20-\x7E]/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

                if (!ascii) return "";

                const compact = ascii.replace(/\s/g, "");
                if (!compact) return "";

                const readableChars = (compact.match(/[A-Za-z0-9]/g) || []).length;
                const readableRatio = readableChars / compact.length;

                return readableRatio >= 0.45 ? ascii : "";
            };

            const writeWrapped = (text: string, fontSize = 11, color: [number, number, number] = [75, 85, 99], gap = 18) => {
                pdf.setFontSize(fontSize);
                pdf.setTextColor(color[0], color[1], color[2]);
                const lines = pdf.splitTextToSize(text, pageWidth - marginX * 2);
                pdf.text(lines, marginX, cursorY);
                cursorY += lines.length * gap;
            };

            const ensureSpace = (required = 40) => {
                if (cursorY + required <= pageHeight - 50) return;
                pdf.addPage();
                paintPageTheme();
                cursorY = 56;
            };

            paintPageTheme();
            pdf.setTextColor(245, 158, 11);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(13);
            pdf.text("SANSKRIT SADHANA", marginX, cursorY);
            cursorY += 26;

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(26);
            pdf.text("Detailed Pronunciation Report", marginX, cursorY);
            cursorY += 28;

            pdf.setFont("helvetica", "normal");
            writeWrapped(`Shloka: ${selectedShloka.title}`, 12, [255, 255, 255], 17);
            writeWrapped(`Reference: ${selectedShloka.reference || selectedShloka.source}`, 11, [226, 232, 240], 16);
            writeWrapped(`Source: ${selectedShloka.source}`, 11, [148, 163, 184], 16);
            writeWrapped(`Generated: ${new Date().toLocaleString()}`, 10, [148, 163, 184], 16);

            cursorY += 8;
            pdf.setDrawColor(245, 158, 11);
            pdf.line(marginX, cursorY, pageWidth - marginX, cursorY);
            cursorY += 28;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(18);
            pdf.setTextColor(255, 255, 255);
            pdf.text(`Score: ${results.score}/100`, marginX, cursorY);
            cursorY += 24;

            pdf.setFont("helvetica", "normal");
            writeWrapped(scoreSummary.message, 11, [203, 213, 225], 17);

            ensureSpace(120);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.setTextColor(245, 158, 11);
            pdf.text("Performance Breakdown", marginX, cursorY);
            cursorY += 22;

            pdf.setFont("helvetica", "normal");
            writeWrapped(`Matched phonemes: ${scoreBreakdown.matches}`, 11, [255, 255, 255], 16);
            writeWrapped(`Expected phonemes: ${scoreBreakdown.totalRef}`, 11, [255, 255, 255], 16);
            writeWrapped(`Detected mismatches: ${scoreBreakdown.refMismatches}`, 11, [255, 255, 255], 16);
            writeWrapped(`Extra detected sounds: ${scoreBreakdown.extraSounds}`, 11, [203, 213, 225], 16);
            writeWrapped(`Alignment: ${scoreBreakdown.alignment}%`, 11, [203, 213, 225], 16);
            writeWrapped(`Consistency: ${scoreBreakdown.consistency}%`, 11, [203, 213, 225], 16);
            writeWrapped(`Clarity: ${scoreBreakdown.clarity}%`, 11, [203, 213, 225], 16);

            ensureSpace(80);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.setTextColor(245, 158, 11);
            pdf.text("Reference Text", marginX, cursorY);
            cursorY += 22;
            pdf.setFont("helvetica", "normal");
            const readableReferenceText = toPdfReadableText(selectedShloka.text);
            const readableTransliteration = toPdfReadableText(selectedShloka.transliteration);

            if (readableReferenceText) {
                writeWrapped(readableReferenceText, 12, [255, 255, 255], 18);
            } else {
                writeWrapped("Reference text omitted in PDF due to unreadable characters for the current export font.", 10, [148, 163, 184], 16);
            }

            if (readableTransliteration) {
                writeWrapped(readableTransliteration, 11, [203, 213, 225], 17);
            }

            if (results.transcript) {
                ensureSpace(60);
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(245, 158, 11);
                pdf.text("Recognized Transcript", marginX, cursorY);
                cursorY += 22;
                pdf.setFont("helvetica", "normal");
                const readableTranscript = toPdfReadableText(results.transcript);
                if (readableTranscript) {
                    writeWrapped(readableTranscript, 11, [255, 255, 255], 17);
                } else {
                    writeWrapped("Recognized transcript omitted due to unreadable characters.", 10, [148, 163, 184], 16);
                }
            }

            ensureSpace(80);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.setTextColor(245, 158, 11);
            pdf.text("Phonetic Insights", marginX, cursorY);
            cursorY += 24;

            if (scoreBreakdown.errors.length === 0) {
                writeWrapped("No significant errors detected in this attempt.", 11, [203, 213, 225], 17);
            } else {
                const tableWidth = pageWidth - marginX * 2;
                const colWidths = [34, 220, 90, 90, tableWidth - 34 - 220 - 90 - 90];
                const rowHeight = 22;
                const headerHeight = 24;
                const tableBottom = pageHeight - 48;
                const headers = ["#", "Description", "Expected", "Heard", "Pos"];

                const drawTableHeader = () => {
                    ensureSpace(headerHeight + 8);
                    pdf.setFillColor(28, 28, 28);
                    pdf.rect(marginX, cursorY, tableWidth, headerHeight, "F");
                    pdf.setDrawColor(60, 60, 60);
                    pdf.rect(marginX, cursorY, tableWidth, headerHeight);

                    pdf.setFont("helvetica", "bold");
                    pdf.setFontSize(10);
                    pdf.setTextColor(245, 158, 11);

                    let x = marginX;
                    headers.forEach((header, idx) => {
                        pdf.text(header, x + 6, cursorY + 15);
                        if (idx < headers.length - 1) {
                            pdf.line(x + colWidths[idx], cursorY, x + colWidths[idx], cursorY + headerHeight);
                        }
                        x += colWidths[idx];
                    });

                    cursorY += headerHeight;
                };

                const fitCell = (text: string, width: number) => {
                    const normalized = text.replace(/\s+/g, " ").trim();
                    if (!normalized) return "-";

                    const lines = pdf.splitTextToSize(normalized, Math.max(10, width - 12));
                    const firstLine = Array.isArray(lines) ? (lines[0] ?? "") : String(lines);
                    if (Array.isArray(lines) && lines.length > 1) {
                        return `${String(firstLine).replace(/\s+$/, "")}...`;
                    }
                    return String(firstLine);
                };

                drawTableHeader();

                scoreBreakdown.errors.forEach((error, index) => {
                    if (cursorY + rowHeight > tableBottom) {
                        pdf.addPage();
                        paintPageTheme();
                        cursorY = 56;
                        pdf.setFont("helvetica", "bold");
                        pdf.setFontSize(12);
                        pdf.setTextColor(245, 158, 11);
                        pdf.text("Phonetic Insights (continued)", marginX, cursorY);
                        cursorY += 16;
                        drawTableHeader();
                    }

                    const rowShade = index % 2 === 0 ? 20 : 16;
                    pdf.setFillColor(rowShade, rowShade, rowShade);
                    pdf.rect(marginX, cursorY, tableWidth, rowHeight, "F");
                    pdf.setDrawColor(52, 52, 52);
                    pdf.rect(marginX, cursorY, tableWidth, rowHeight);

                    let x = marginX;
                    for (let i = 0; i < colWidths.length - 1; i += 1) {
                        x += colWidths[i];
                        pdf.line(x, cursorY, x, cursorY + rowHeight);
                    }

                    const description = fitCell(error.description, colWidths[1]);
                    const readableExpected = fitCell(toPdfReadableText(error.ref_ph ?? "") || "-", colWidths[2]);
                    const readableHeard = fitCell(toPdfReadableText(error.hyp_ph ?? "") || "(omitted)", colWidths[3]);

                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(10);
                    pdf.setTextColor(226, 232, 240);

                    const cells = [
                        String(index + 1),
                        description,
                        readableExpected,
                        readableHeard,
                        String(error.ref_idx + 1),
                    ];

                    let cellX = marginX;
                    cells.forEach((cell, cellIndex) => {
                        pdf.text(cell, cellX + 6, cursorY + 14);
                        cellX += colWidths[cellIndex];
                    });

                    cursorY += rowHeight;
                });
            }

            const totalPages = pdf.getNumberOfPages();
            for (let page = 1; page <= totalPages; page += 1) {
                pdf.setPage(page);
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(203, 213, 225);
                pdf.text(`Page ${page}`, pageWidth - marginX, pageHeight - 24, { align: "right" });
            }

            const safeTitle = selectedShloka.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            pdf.save(`${safeTitle || "sanskrit-sadhana"}-report.pdf`);
        } finally {
            setIsDownloadingReport(false);
        }
    };

    return (
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
            <div className="absolute inset-x-0 top-6 -z-10 h-56 rounded-[2.5rem] bg-gradient-to-r from-saffron-500/10 via-transparent to-gold-500/10 blur-3xl" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 glass px-6 py-8 sm:px-8"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,106,26,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(198,177,29,0.18),transparent_26%)]" />
                <div className="absolute left-6 top-5 text-6xl text-primary/8 sm:text-8xl">ॐ</div>
                <div className="absolute top-4 right-4 z-20 flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-end gap-3">
                    <ThemeToggle />
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="flex shrink-0 items-center gap-3 glass px-4 py-2 rounded-full border-white/10 hover:border-primary/30 transition-all"
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
                <div className="relative z-10 grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                            <Waves className="h-3.5 w-3.5" />
                            Gurukula Recitation Chamber
                        </div>
                        <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                            Sanskrit <span className="text-gradient">Sadhana</span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                            Enter a practice hall shaped like a modern gurukula: sacred text in front of you, guided
                            listening at your side, and measured phonetic feedback like a patient guru correcting each sound.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link href="/custom" className="btn btn-primary inline-flex items-center gap-2 text-sm">
                                Custom Practice Mode <ArrowRight className="w-4 h-4" />
                            </Link>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                <Target className="h-3.5 w-3.5 text-primary" />
                                Precision-first chanting
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                        <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4 dark:bg-white/5">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Shloka Library</p>
                            <p className="mt-2 text-3xl font-black">{SHLOKAS.length}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Curated passages waiting for recitation.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4 dark:bg-white/5">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Guided Method</p>
                            <p className="mt-2 text-base font-semibold">Listen, chant, refine</p>
                            <p className="mt-1 text-sm text-muted-foreground">A calmer loop from oral tradition to analysis.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4 dark:bg-white/5">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Guru&apos;s Note</p>
                            <p className="mt-2 text-base font-semibold">Every score teaches</p>
                            <p className="mt-1 text-sm text-muted-foreground">See why a chant landed well and where the next correction belongs.</p>
                        </div>
                    </div>
                </div>
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

                    <div className="glass space-y-3 min-h-[540px] rounded-[1.75rem] p-4">
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
                                                "w-full text-left p-4 rounded-2xl border transition-all duration-300",
                                                selectedShloka?.id === shloka.id
                                                    ? "border-primary/40 bg-primary/10 saffron-glow -translate-y-0.5"
                                                    : "border-white/8 bg-black/5 hover:border-primary/25 hover:bg-primary/6 dark:bg-white/4"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold">{shloka.title}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">{shloka.source}</p>
                                                    <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-primary/70">
                                                        {shloka.reference}
                                                    </p>
                                                    {shloka.audioUrl || shloka.audioReferenceUrl ? (
                                                        <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-gold-400/80">
                                                            Reference audio available
                                                        </p>
                                                    ) : null}
                                                </div>
                                                {selectedShloka?.id === shloka.id && (
                                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                                )}
                                            </div>
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
                            className="glass rounded-[2rem] p-6 sm:p-8 saffron-glow border-primary/20 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,106,26,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(198,177,29,0.14),transparent_26%)]"></div>

                            <div className="relative z-10 px-2 sm:px-4">
                                <div className="grid gap-6 mb-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
                                    <div className="text-center lg:text-left">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Devanagari</span>
                                        <p className="text-3xl font-serif leading-relaxed mb-6">{selectedShloka.text}</p>
                                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto lg:mx-0 mb-6"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Transliteration</span>
                                        <p className="text-xl italic text-muted-foreground leading-relaxed">
                                            {transliterationWords.map((word, index) => (
                                                (() => {
                                                    const severity = wordSeverityByIndex.get(index) ?? 'low';
                                                    const severityClasses = getSeverityClasses(severity);
                                                    const tooltipText = highlightedWordIndexes.has(index)
                                                        ? `Pronunciation issue on "${word}" (${severity} severity).`
                                                        : '';

                                                    return (
                                                <span
                                                    key={`${word}-${index}`}
                                                    title={tooltipText}
                                                    className={cn(
                                                        'mr-2 inline-block rounded-md px-1 py-0.5 transition-colors',
                                                        highlightedWordIndexes.has(index)
                                                            ? severityClasses.word
                                                            : 'text-muted-foreground'
                                                    )}
                                                >
                                                    {word}
                                                </span>
                                                    );
                                                })()
                                            ))}
                                        </p>
                                        {(results?.analysis?.word_mismatches?.length ?? 0) > 0 ? (
                                            <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200">Word-level correction</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {(['high', 'medium', 'low'] as MismatchSeverity[]).map((level) => {
                                                        const classes = getSeverityClasses(level);
                                                        return (
                                                            <span
                                                                key={level}
                                                                className={cn('rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]', classes.badge)}
                                                            >
                                                                {level}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    {(results?.analysis?.word_mismatches ?? []).slice(0, 6).map((item, idx) => {
                                                        const severity =
                                                            (typeof item.expected_index === 'number' && wordSeverityByIndex.get(item.expected_index)) ||
                                                            getMismatchDefaultSeverity(item.mismatch_type);
                                                        const classes = getSeverityClasses(severity);
                                                        const tooltipText = getMismatchTooltipText(item, severity);

                                                        if (item.mismatch_type === 'replace' && item.expected_word && item.pronounced_word) {
                                                            return (
                                                                <p
                                                                    key={`${item.expected_index}-${idx}`}
                                                                    title={tooltipText}
                                                                    className={cn('rounded-md border px-2 py-1 text-xs', classes.item)}
                                                                >
                                                                    &quot;{item.expected_word}&quot; pronounced as &quot;{item.pronounced_word}&quot;
                                                                </p>
                                                            );
                                                        }

                                                        if (item.mismatch_type === 'delete' && item.expected_word) {
                                                            return (
                                                                <p
                                                                    key={`${item.expected_index}-${idx}`}
                                                                    title={tooltipText}
                                                                    className={cn('rounded-md border px-2 py-1 text-xs', classes.item)}
                                                                >
                                                                    Missing word: &quot;{item.expected_word}&quot;
                                                                </p>
                                                            );
                                                        }

                                                        if (item.mismatch_type === 'insert' && item.pronounced_word) {
                                                            return (
                                                                <p
                                                                    key={`${item.pronounced_index}-${idx}`}
                                                                    title={tooltipText}
                                                                    className={cn('rounded-md border px-2 py-1 text-xs', classes.item)}
                                                                >
                                                                    Extra spoken word: &quot;{item.pronounced_word}&quot;
                                                                </p>
                                                            );
                                                        }

                                                        return null;
                                                    })}
                                                </div>
                                            </div>
                                        ) : null}
                                        <div className="mt-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary/75">
                                            Reference: {selectedShloka.reference || selectedShloka.source}
                                        </div>
                                        {selectedShloka.audioReferenceUrl ? (
                                            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300">
                                                <Volume2 className="h-3.5 w-3.5 shrink-0" />
                                                Reference audio source: {selectedShloka.audioSourceName || "Trusted source"}
                                            </div>
                                        ) : null}
                                        <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4 text-left dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-primary/70">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                Meaning
                                            </div>
                                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedShloka.meaning}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5 dark:bg-white/5">
                                        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Practice flow</p>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div className="rounded-xl border border-white/8 bg-white/6 p-3">
                                                <p className="font-semibold">1. Listen to the reference</p>
                                                <p className="mt-1 text-muted-foreground">Absorb pacing, stress, and vowel length before recording.</p>
                                            </div>
                                            <div className="rounded-xl border border-white/8 bg-white/6 p-3">
                                                <p className="font-semibold">2. Record one focused attempt</p>
                                                <p className="mt-1 text-muted-foreground">Aim for clarity over speed. Smooth articulation improves the score.</p>
                                            </div>
                                            <div className="rounded-xl border border-white/8 bg-white/6 p-3">
                                                <p className="font-semibold">3. Read the score explanation</p>
                                                <p className="mt-1 text-muted-foreground">Use the alignment and error cards to understand what changed the result.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-6 rounded-[1.75rem] border border-white/10 bg-black/10 px-4 py-6 dark:bg-white/5">
                                    <div className="text-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Practice Controls</span>
                                        <p className="text-sm text-muted-foreground">Reference, record, then analyze your pronunciation.</p>
                                        {selectedShloka.audioReferenceUrl ? (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Trusted source: <span className="text-gold-300">{selectedShloka.audioSourceName}</span>
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="mb-2 flex flex-wrap items-center justify-center gap-6">
                                        {selectedShloka.audioUrl && (
                                            <button
                                                onClick={() => playReference(selectedShloka.audioUrl!)}
                                                className="flex flex-col items-center gap-2 group"
                                            >
                                                <div className="w-14 h-14 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition-colors group-hover:scale-110">
                                                    <Volume2 className="w-6 h-6 text-primary" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Play audio</span>
                                            </button>
                                        )}

                                        {selectedShloka.audioReferenceUrl && (
                                            <button
                                                onClick={() => openReferenceAudio(selectedShloka.audioReferenceUrl!)}
                                                className="flex flex-col items-center gap-2 group"
                                            >
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/30 transition-colors group-hover:scale-110 group-hover:bg-gold-500/10">
                                                    <ExternalLink className="h-5 w-5 text-gold-300" />
                                                </div>
                                                <span className="text-center text-[10px] font-bold uppercase tracking-widest text-gold-300">
                                                    Open source
                                                </span>
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

                                    {!selectedShloka.audioUrl && selectedShloka.audioReferenceUrl ? (
                                        <div className="rounded-2xl border border-gold-500/15 bg-gold-500/5 px-4 py-3 text-center text-xs leading-6 text-muted-foreground">
                                            This shloka uses an external reference-audio page instead of built-in playback. Use <span className="text-gold-300">Open source</span> to hear the guided chant.
                                        </div>
                                    ) : null}

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
                            <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                                {/* Score Card */}
                                <div className="glass relative h-full overflow-hidden rounded-[2.25rem] border-white/10 p-6">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,106,26,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(198,177,29,0.16),transparent_28%)]"></div>
                                    <div className="relative z-10">
                                        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Award className="w-5 h-5 text-accent" />
                                                Pronunciation Score
                                            </h3>
                                            <div className="flex items-center gap-3 flex-wrap justify-end">
                                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                                                    AI Recitation Reading
                                                </div>
                                                <button
                                                    onClick={downloadDetailedReport}
                                                    disabled={isDownloadingReport}
                                                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    {isDownloadingReport ? "Preparing PDF..." : "Download PDF"}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="relative rounded-[1.9rem] border border-white/10 bg-black/20 px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:bg-white/5">
                                                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                                <div className={cn("mb-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]", scoreSummary?.badgeClassName)}>
                                                    {scoreSummary?.label}
                                                </div>
                                                <div className={cn("bg-gradient-to-r bg-clip-text text-7xl font-black leading-none text-transparent", scoreSummary?.scoreClassName)}>
                                                    {results.score}
                                                </div>
                                                <span className="mt-2 block text-sm font-semibold text-muted-foreground">out of 100</span>
                                            </div>

                                            <div className="rounded-[1.6rem] border border-white/10 bg-black/10 p-5 dark:bg-white/5">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">Interpretation</p>
                                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{scoreSummary?.message}</p>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <InsightStat title="Matched" value={scoreBreakdown?.matches ?? 0} caption="Aligned phonemes" accentClassName="from-transparent via-emerald-400/80 to-transparent" />
                                                <InsightStat title="Reference" value={scoreBreakdown?.totalRef ?? 0} caption="Expected phonemes" accentClassName="from-transparent via-primary/80 to-transparent" />
                                                <InsightStat title="Issues" value={scoreBreakdown?.refMismatches ?? 0} caption="Reference-side mismatches" accentClassName="from-transparent via-rose-400/80 to-transparent" />
                                            </div>

                                            <div className="rounded-[1.6rem] border border-white/10 bg-black/10 p-5 dark:bg-white/5">
                                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Practice profile</p>
                                                    <p className="text-[10px] uppercase tracking-[0.16em] text-primary/70 sm:text-right">Live breakdown</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <MetricBar label="Alignment" value={scoreBreakdown?.alignment ?? 0} tone="from-primary to-orange-400" />
                                                    <MetricBar label="Consistency" value={scoreBreakdown?.consistency ?? 0} tone="from-gold-400 to-yellow-300" />
                                                    <MetricBar label="Clarity" value={scoreBreakdown?.clarity ?? 0} tone="from-emerald-400 to-teal-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Insights */}
                                <div className="glass group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2.25rem] border-white/10 p-6">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(171,142,23,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(240,106,26,0.08),transparent_24%)]" />
                                    <div className="relative z-10 flex h-full min-h-0 flex-col">
                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-secondary" />
                                                Phonetic Insights
                                            </h3>
                                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                                                Detailed guidance
                                            </div>
                                        </div>
                                        <div className="mb-4 rounded-[1.6rem] border border-white/10 bg-black/10 p-5 text-sm text-muted-foreground dark:bg-white/5">
                                            <p className="font-semibold text-foreground">Why this score?</p>
                                            <p className="mt-2 leading-6">
                                                The score starts near 100 and deducts points when the chant differs from the expected phoneme sequence.
                                                Missing sounds reduce the score the most, substitutions next, and extra sounds least. The cards below show
                                                the exact mismatches that influenced the result.
                                            </p>
                                        </div>
                                        {(() => {
                                            const errors = results.analysis.errors;
                                            const totalInsightPages = Math.max(1, Math.ceil(errors.length / insightsPerPage));
                                            const safePage = Math.min(insightPage, totalInsightPages);
                                            const startIndex = (safePage - 1) * insightsPerPage;
                                            const currentInsights = errors.slice(startIndex, startIndex + insightsPerPage);

                                            return (
                                                <>
                                                    {errors.length > 0 ? (
                                                        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground dark:bg-white/5">
                                                            <span>Insights Navigation</span>
                                                            <span>Page {safePage} of {totalInsightPages}</span>
                                                        </div>
                                                    ) : null}

                                                    <div className="custom-scrollbar relative z-10 flex-1 min-h-0 space-y-3 overflow-y-auto pr-2">
                                                        {errors.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/10 py-10 text-center dark:bg-white/5">
                                                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                                                                    <Award className="h-6 w-6 text-accent" />
                                                                </div>
                                                                <p className="text-accent font-medium uppercase tracking-widest text-[10px]">Perfection Achieved</p>
                                                                <p className="mt-1 text-sm text-white/50">No significant errors detected.</p>
                                                            </div>
                                                        ) : (
                                                            currentInsights.map((err: AnalysisError, idx: number) => (
                                                                <div key={`${safePage}-${idx}`} className="grid min-h-[8.5rem] grid-cols-[2.25rem_1fr] items-start gap-3 rounded-[1.35rem] border border-white/8 bg-white/5 p-4 transition-colors hover:border-primary/20">
                                                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                                                        <span className="text-xs font-bold text-red-400">{startIndex + idx + 1}</span>
                                                                    </div>
                                                                    <div className="flex min-h-[6.4rem] flex-col justify-between">
                                                                        <p className="font-semibold text-white/90">{err.description}</p>
                                                                        <div className="mt-2 flex w-fit flex-wrap items-center gap-2 rounded-xl border border-white/8 bg-black/10 px-3 py-2 dark:bg-white/5">
                                                                            <span className="text-[10px] font-bold uppercase tracking-tight text-white/30">Expected</span>
                                                                            <span className="text-sm font-mono text-accent">&quot;{err.ref_ph}&quot;</span>
                                                                            <div className="mx-1 h-3 w-[1px] bg-white/10"></div>
                                                                            <span className="text-[10px] font-bold uppercase tracking-tight text-white/30">Heard</span>
                                                                            <span className="text-sm font-mono text-red-400">&quot;{err.hyp_ph || "(silence)"}&quot;</span>
                                                                        </div>
                                                                        <p className="mt-2 text-[10px] uppercase tracking-widest text-white/20">At position {err.ref_idx + 1}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {errors.length > 0 ? (
                                                        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-3 py-2 dark:bg-white/5">
                                                            <button
                                                                onClick={() => setInsightPage((p) => Math.max(1, p - 1))}
                                                                disabled={safePage === 1}
                                                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                                Previous
                                                            </button>
                                                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Showing {currentInsights.length} of {errors.length}</span>
                                                            <button
                                                                onClick={() => setInsightPage((p) => Math.min(totalInsightPages, p + 1))}
                                                                disabled={safePage === totalInsightPages}
                                                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                                                            >
                                                                Next
                                                                <ChevronRight className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </>
                                            );
                                        })()}
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

