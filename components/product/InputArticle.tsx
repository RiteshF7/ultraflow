'use client';

import React, { useState, useRef } from 'react';
import ArticleHistory from './ArticleHistory';
import { saveArticle } from '@/lib/utils/articleCache';
import { THEME } from '@/constants/theme';
import Button from './ui/Button';
import FileExplorerItem from './ui/FileExplorerItem';
import TabBar from './ui/TabBar';
import ErrorBanner from './ui/ErrorBanner';
import { BannerGeneratorButton } from '@/lib/bannerImageGenerator';

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
}

export default function InputArticle({ 
  setArticle, 
  onNext, 
  loading, 
  error
}: InputArticleProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
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
        
        // Auto-select the first uploaded file
        if (articles.length === 0 && i === 0) {
          setSelectedArticleId(newArticle.id);
        }
      } catch (err) {
        setFileError(`Error reading file "${file.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Reset file input
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
      setSelectedArticleId(articles.length > 1 ? articles[0].id : null);
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

    // Save article to cache before processing
    try {
      await saveArticle(selectedArticle.content, selectedArticle.name);
      console.log('Article saved to cache');
    } catch (err) {
      console.error('Error saving article to cache:', err);
      // Don't block processing if cache fails
    }

    // Set article and call onNext
    setArticle(selectedArticle.content);
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

  return (
    <div style={{
      height: '100vh',
      backgroundColor: THEME.colors.background,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: THEME.typography.fontFamily,
    }}>
      {/* Top Bar */}
      <div style={{
        height: '48px',
        backgroundColor: THEME.colors.secondaryBg,
        borderBottom: `1px solid ${THEME.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${THEME.spacing.lg}`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing.lg }}>
          <h1 style={{
            fontSize: THEME.typography.fontSize.md,
            fontWeight: THEME.typography.fontWeight.normal,
            color: THEME.colors.text,
            margin: 0
          }}>
            Article to Flowchart - Input
          </h1>
        </div>

        {/* Action Buttons in Top Bar */}
        <div style={{ display: 'flex', gap: THEME.spacing.sm, alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="secondary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            📁 Upload Files
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={handlePasteText}
            disabled={loading}
          >
            📝 New Text
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={handleLoadSample}
            disabled={loading}
          >
            🎯 Load Sample
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowHistory(true)}
            disabled={loading}
          >
            📚 History
          </Button>

          {/* Banner Image Generator */}
          <BannerGeneratorButton
            articleContent={selectedArticle?.content}
            articleTitle={selectedArticle?.name}
            disabled={loading || !selectedArticle}
          />
        </div>
      </div>

      {/* Article History Modal */}
      {showHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: THEME.colors.overlay,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: THEME.zIndex.modal,
          padding: THEME.spacing.xxl
        }}>
          <div style={{
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: THEME.borderRadius.lg
          }}>
            <ArticleHistory 
              onSelectArticle={handleLoadFromHistory}
              onClose={() => setShowHistory(false)}
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {(fileError || error) && (
        <ErrorBanner 
          message={fileError || error}
          type="error"
        />
      )}

      {/* Main Content Area - IDE Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Left Sidebar - File Explorer */}
        <div style={{
          width: '250px',
          backgroundColor: THEME.colors.sidebarBg,
          borderRight: `1px solid ${THEME.colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
            fontSize: THEME.typography.fontSize.xs,
            fontWeight: THEME.typography.fontWeight.semibold,
            color: THEME.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `1px solid ${THEME.colors.border}`,
            fontFamily: THEME.typography.fontFamily,
          }}>
            Explorer
          </div>

          {/* File List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${THEME.spacing.xs} 0`
          }}>
            {articles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: `${THEME.spacing.xxl} ${THEME.spacing.lg}`,
                color: THEME.colors.textMuted,
                fontSize: THEME.typography.fontSize.sm,
                fontFamily: THEME.typography.fontFamily,
              }}>
                No articles yet
              </div>
            ) : (
              articles.map((article) => (
                <FileExplorerItem
                  key={article.id}
                  id={article.id}
                  name={article.name}
                  type={article.type}
                  isSelected={selectedArticleId === article.id}
                  onClick={() => setSelectedArticleId(article.id)}
                  onDelete={handleDeleteArticle}
                />
              ))
            )}
          </div>
        </div>

        {/* Center - Editor Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Tab Bar */}
          {selectedArticle && (
            <TabBar
              fileName={selectedArticle.name}
              fileType={selectedArticle.type}
              stats={{
                characters: selectedArticle.content.length,
                lines: selectedArticle.content.split('\n').length
              }}
            />
          )}

          {/* Editor Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative'
          }}>
            {selectedArticle ? (
              <>
                {/* Text Editor */}
                <textarea
                  value={selectedArticle.content}
                  onChange={(e) => handleUpdateArticleContent(e.target.value)}
                  placeholder="Paste or type your article here..."
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: THEME.spacing.lg,
                    border: 'none',
                    outline: 'none',
                    fontSize: THEME.typography.fontSize.md,
                    fontFamily: THEME.typography.fontFamilyMono,
                    backgroundColor: THEME.colors.background,
                    color: THEME.colors.text,
                    resize: 'none',
                    lineHeight: THEME.typography.lineHeight.relaxed,
                    tabSize: 2
                  }}
                  spellCheck={false}
                />
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: THEME.spacing.xxxl,
                textAlign: 'center',
                color: THEME.colors.textMuted,
                fontFamily: THEME.typography.fontFamily,
              }}>
                <div style={{ fontSize: '3rem', marginBottom: THEME.spacing.lg }}>📄</div>
                <p style={{ 
                  fontSize: THEME.typography.fontSize.lg, 
                  fontWeight: THEME.typography.fontWeight.medium, 
                  marginBottom: THEME.spacing.sm, 
                  color: THEME.colors.text 
                }}>
                  No article selected
                </p>
                <p style={{ fontSize: THEME.typography.fontSize.md }}>
                  Upload a file, create new text, or load a sample to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Right Process Button */}
      <div style={{
        position: 'fixed',
        bottom: THEME.spacing.xl,
        right: THEME.spacing.xl,
        zIndex: THEME.zIndex.dropdown
      }}>
        <Button
          variant="success"
          size="large"
          onClick={handleProcess}
          disabled={loading || articles.length === 0 || !selectedArticle}
          loading={loading}
        >
          {loading ? '⏳ Processing...' : '🚀 Generate Flowchart'}
          {!loading && <span>→</span>}
        </Button>
      </div>
    </div>
  );
}
