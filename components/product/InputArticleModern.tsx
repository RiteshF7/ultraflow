'use client';

import React, { useState, useRef } from 'react';
import ArticleHistory from './ArticleHistory';
import { saveArticle } from '@/lib/utils/articleCache';
import { BannerGeneratorButton } from '@/lib/bannerImageGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  FileText,
  History,
  Sparkles,
  Trash2,
  ArrowRight,
  File,
  X,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SAMPLE_ARTICLE = `# Understanding Machine Learning

Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed.

## Types of Machine Learning

### Supervised Learning
Supervised learning involves training a model on labeled data. The algorithm learns to map inputs to outputs based on example input-output pairs.

Common algorithms include:
- Linear Regression
- Decision Trees
- Neural Networks

### Unsupervised Learning
Unsupervised learning works with unlabeled data. The algorithm tries to find patterns and structure in the data without guidance.

Key techniques:
- Clustering (K-means, Hierarchical)
- Dimensionality Reduction (PCA)
- Association Rules

### Reinforcement Learning
Reinforcement learning involves an agent learning to make decisions by taking actions in an environment to maximize rewards.

## Applications
Machine learning is used in various fields:
- Healthcare: Disease diagnosis and drug discovery
- Finance: Fraud detection and algorithmic trading
- Technology: Recommendation systems and natural language processing

## Conclusion
Machine learning continues to evolve and transform industries worldwide.`;

interface ArticleItem {
  id: string;
  name: string;
  content: string;
  type: 'file' | 'pasted';
}

interface InputArticleProps {
  article: string;
  setArticle: (article: string) => void;
  onNext: () => void;
  loading: boolean;
  error: string;
  count: number;
  setCount: (count: number) => void;
}

export default function InputArticleModern({
  setArticle,
  onNext,
  loading,
  error,
  count,
  setCount
}: InputArticleProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [specialInstruction, setSpecialInstruction] = useState('');

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'md' && fileExt !== 'txt') {
        setFileError(`File "${file.name}" is not supported. Only .md and .txt files are allowed.`);
        continue;
      }

      try {
        const content = await file.text();
        const newArticle: ArticleItem = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          content: content,
          type: 'file'
        };

        setArticles(prev => [...prev, newArticle]);

        if (articles.length === 0 && i === 0) {
          setSelectedArticleId(newArticle.id);
        }
      } catch (err) {
        setFileError(`Error reading file "${file.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteText = () => {
    const newArticle: ArticleItem = {
      id: `pasted-${Date.now()}`,
      name: `Pasted Text ${articles.filter(a => a.type === 'pasted').length + 1}`,
      content: '',
      type: 'pasted'
    };

    setArticles(prev => [...prev, newArticle]);
    setSelectedArticleId(newArticle.id);
  };

  const handleLoadSample = () => {
    const newArticle: ArticleItem = {
      id: `sample-${Date.now()}`,
      name: 'Sample: Machine Learning',
      content: SAMPLE_ARTICLE,
      type: 'pasted'
    };

    setArticles(prev => [...prev, newArticle]);
    setSelectedArticleId(newArticle.id);
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    if (selectedArticleId === id) {
      const remaining = articles.filter(a => a.id !== id);
      setSelectedArticleId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateArticleContent = (content: string) => {
    if (!selectedArticleId) return;
    setArticles(prev => prev.map(a =>
      a.id === selectedArticleId ? { ...a, content } : a
    ));
  };

  const handleProcess = async () => {
    if (articles.length === 0) {
      setFileError('Please add at least one article or file.');
      return;
    }

    if (!selectedArticle) {
      setFileError('Please select an article.');
      return;
    }

    if (!selectedArticle.content.trim()) {
      setFileError('Selected article is empty. Please add content.');
      return;
    }

    // Merge article content with special instructions
    let finalContent = selectedArticle.content;
    if (specialInstruction.trim()) {
      finalContent = `${selectedArticle.content}\n\n---\n\nSpecial Instructions:\n${specialInstruction.trim()}`;
    }

    try {
      await saveArticle(finalContent, selectedArticle.name);
      console.log('Article saved to cache');
    } catch (err) {
      console.error('Error saving article to cache:', err);
    }

    setArticle(finalContent);
    onNext();
  };

  const handleLoadFromHistory = (content: string) => {
    const newArticle: ArticleItem = {
      id: `history-${Date.now()}`,
      name: `From History ${articles.filter(a => a.name.startsWith('From History')).length + 1}`,
      content: content,
      type: 'pasted'
    };

    setArticles(prev => [...prev, newArticle]);
    setSelectedArticleId(newArticle.id);
    setShowHistory(false);
  };

  const stats = selectedArticle ? {
    words: selectedArticle.content.split(/\s+/).filter(Boolean).length,
    characters: selectedArticle.content.length,
    lines: selectedArticle.content.split('\n').length
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Article to Flowchart
          </h1>
          <p className="text-muted-foreground text-lg">
            Transform your articles into beautiful flowcharts instantly
          </p>
        </div>

        {/* Error Display */}
        {(fileError || error) && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="font-medium">{fileError || error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Articles List */}
          <Card className="lg:col-span-1 h-fit sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Your Articles</CardTitle>
              <CardDescription>
                {articles.length === 0 ? 'No articles yet' : `${articles.length} article${articles.length > 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePasteText}
                  disabled={loading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  New Text
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLoadSample}
                  disabled={loading}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Load Sample
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowHistory(true)}
                  disabled={loading}
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </div>

              {articles.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className={cn(
                        "group p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedArticleId === article.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50 border-border"
                      )}
                      onClick={() => setSelectedArticleId(article.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm truncate">{article.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArticle(article.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                      {selectedArticleId === article.id && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {article.content.split(/\s+/).filter(Boolean).length} words
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Editor */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>
                    {selectedArticle ? selectedArticle.name : 'No Article Selected'}
                  </CardTitle>
                  {stats && (
                    <CardDescription className="mt-2 flex gap-4">
                      <span>{stats.words} words</span>
                      <span>{stats.characters} characters</span>
                      <span>{stats.lines} lines</span>
                    </CardDescription>
                  )}
                </div>
                {selectedArticle && (
                  <BannerGeneratorButton
                    articleContent={selectedArticle.content}
                    articleTitle={selectedArticle.name}
                    disabled={loading}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedArticle ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Article Content
                    </label>
                    <Textarea
                      value={selectedArticle.content}
                      onChange={(e) => handleUpdateArticleContent(e.target.value)}
                      placeholder="Paste or type your article here..."
                      className="min-h-[400px] font-mono text-sm resize-none"
                      disabled={loading}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-primary" />
                        Number of Flowcharts: <span className="text-primary font-bold">{count}</span>
                      </label>
                      <span className="text-xs text-muted-foreground">
                        Max 10
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-xs text-muted-foreground">1</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        disabled={loading}
                      />
                      <span className="text-xs text-muted-foreground">10</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Special Instructions (Optional)
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {specialInstruction.length} characters
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Add instructions for the AI (e.g., focus areas, style preferences, specific details to include/exclude)
                    </p>
                    <Textarea
                      value={specialInstruction}
                      onChange={(e) => setSpecialInstruction(e.target.value)}
                      placeholder="e.g., Focus on the main workflow, exclude technical details, use simple language..."
                      className="min-h-[150px] text-sm resize-none"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleProcess}
                    disabled={loading || !selectedArticle.content.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <span className="animate-pulse">⏳</span>
                      </>
                    ) : (
                      <>
                        Generate Flowchart
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Article Selected</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Upload a file, create new text, or load a sample to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <ArticleHistory
              onSelectArticle={handleLoadFromHistory}
              onClose={() => setShowHistory(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

