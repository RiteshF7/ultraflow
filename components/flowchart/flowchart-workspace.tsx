'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Image as ImageIcon, History, Sparkles, Code, Settings2 } from 'lucide-react';
import InputArticleModern from '@/components/product/InputArticleModern';
import ResultsGridModern from '@/components/product/ResultsGridModern';
import LoadingOverlay from '@/components/product/LoadingOverlay';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DiagramData {
    title: string;
    mermaidCode: string;
}

type Tab = 'input' | 'result' | 'history';

export default function FlowchartWorkspace() {
    const [activeTab, setActiveTab] = useState<Tab>('input');
    const [article, setArticle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [diagrams, setDiagrams] = useState<DiagramData[]>([]);
    const [shouldProcess, setShouldProcess] = useState(false);

    // Load diagrams from localStorage on mount
    useEffect(() => {
        try {
            const storedDiagrams = localStorage.getItem('generated-diagrams');
            if (storedDiagrams) {
                const parsed = JSON.parse(storedDiagrams);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setDiagrams(parsed);
                    // Only switch to result if we actually have diagrams and we're not reloading a fresh session intended for input
                    // But for now, let's stay on input by default unless we just generated
                }
            }
        } catch (err) {
            console.error('Error loading diagrams:', err);
        }
    }, []);

    // Process article workflow
    useEffect(() => {
        if (!shouldProcess || !article.trim()) return;

        const processArticle = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch('/api/article-to-flowchart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ article, themeInstructions: '' }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to process article');
                }

                const diagramsData: DiagramData[] = data.step2.diagrams || [];

                if (diagramsData.length === 0) {
                    throw new Error('No diagrams were generated from the article');
                }

                // Update state
                setDiagrams(diagramsData);
                localStorage.setItem('generated-diagrams', JSON.stringify(diagramsData));

                // Switch to result tab
                setActiveTab('result');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
                setShouldProcess(false);
            }
        };

        processArticle();
    }, [shouldProcess, article]);

    const handleNext = () => {
        setShouldProcess(true);
    };

    return (
        <div className="relative min-h-screen pb-24 bg-gradient-to-br from-background via-background to-muted/20">
            <LoadingOverlay isLoading={loading} message="Analyzing text and generating flowcharts..." />

            <main className="container mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <InputArticleModern
                                article={article}
                                setArticle={setArticle}
                                onNext={handleNext}
                                loading={loading}
                                error={error}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ResultsGridModern
                                diagrams={diagrams}
                                loading={loading}
                                error={error}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-center h-[60vh]"
                        >
                            <div className="text-center text-muted-foreground">
                                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-medium">History Coming Soon</h3>
                                <p>Access your past flowcharts here.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Floating Dock Navigation */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 p-2 rounded-full bg-background/10 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] dark:border-white/10 dark:bg-black/20">

                    <DockButton
                        active={activeTab === 'input'}
                        onClick={() => setActiveTab('input')}
                        icon={<FileText className="h-5 w-5" />}
                        label="Input"
                    />

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <DockButton
                        active={activeTab === 'result'}
                        onClick={() => setActiveTab('result')}
                        icon={<ImageIcon className="h-5 w-5" />}
                        label="Result"
                        badge={diagrams.length > 0 ? diagrams.length : undefined}
                    />

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <DockButton
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        icon={<History className="h-5 w-5" />}
                        label="History"
                    />
                </div>
            </div>
        </div>
    );
}

function DockButton({
    active,
    onClick,
    icon,
    label,
    badge
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative group flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                active
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
            )}
        >
            {icon}
            <span className={cn(
                "text-sm font-medium transition-all duration-300",
                active ? "max-w-[100px] opacity-100 ml-1" : "max-w-0 opacity-0 overflow-hidden w-0"
            )}>
                {label}
            </span>
            {badge !== undefined && !active && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {badge}
                </span>
            )}
        </button>
    );
}
