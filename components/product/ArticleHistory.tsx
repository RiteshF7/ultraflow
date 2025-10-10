'use client';

import React, { useState, useEffect } from 'react';
import {
  getAllArticles,
  deleteArticle,
  searchArticles,
  clearAllArticles,
  getCacheStats,
  type CachedArticle
} from '@/lib/utils/articleCache';
import { THEME } from '@/constants/theme';

interface ArticleHistoryProps {
  onSelectArticle: (content: string) => void;
  onClose?: () => void;
}

export default function ArticleHistory({ onSelectArticle, onClose }: ArticleHistoryProps) {
  const [articles, setArticles] = useState<CachedArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<CachedArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalArticles: number;
    totalWords: number;
    totalCharacters: number;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
    loadStats();
  }, []);

  // Filter articles when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchArticles(searchQuery).then(setFilteredArticles);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const cached = await getAllArticles();
      setArticles(cached);
      setFilteredArticles(cached);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const cacheStats = await getCacheStats();
      setStats({
        totalArticles: cacheStats.totalArticles,
        totalWords: cacheStats.totalWords,
        totalCharacters: cacheStats.totalCharacters
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSelectArticle = (article: CachedArticle) => {
    onSelectArticle(article.content);
    if (onClose) onClose();
  };

  const handleDeleteArticle = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        await loadArticles();
        await loadStats();
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete article');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete ALL cached articles? This cannot be undone.')) {
      try {
        await clearAllArticles();
        await loadArticles();
        await loadStats();
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error('Error clearing articles:', error);
        alert('Failed to clear articles');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  return (
    <div style={{
      backgroundColor: THEME.colors.cardBg,
      border: `1px solid ${THEME.colors.border}`,
      borderRadius: THEME.borderRadius.lg,
      padding: THEME.spacing.xxl,
      boxShadow: THEME.shadows.lg,
      fontFamily: THEME.typography.fontFamily,
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: THEME.spacing.lg
      }}>
        <div>
          <h2 style={{ 
            fontSize: THEME.typography.fontSize.xl, 
            fontWeight: THEME.typography.fontWeight.semibold,
            color: THEME.colors.text,
            margin: 0,
            marginBottom: THEME.spacing.xs
          }}>
            📚 Article History
          </h2>
          {stats && (
            <p style={{ 
              fontSize: THEME.typography.fontSize.sm, 
              color: THEME.colors.textMuted,
              margin: 0
            }}>
              {stats.totalArticles} article{stats.totalArticles !== 1 ? 's' : ''} • {stats.totalWords.toLocaleString()} words
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: THEME.spacing.sm }}>
          {articles.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
                backgroundColor: THEME.colors.error,
                color: THEME.colors.white,
                border: 'none',
                borderRadius: THEME.borderRadius.md,
                fontSize: THEME.typography.fontSize.sm,
                fontWeight: THEME.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: THEME.transitions.normal,
                fontFamily: THEME.typography.fontFamily,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.errorHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.colors.error}
            >
              🗑️ Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
                backgroundColor: THEME.colors.active,
                color: THEME.colors.text,
                border: `1px solid ${THEME.colors.border}`,
                borderRadius: THEME.borderRadius.md,
                fontSize: THEME.typography.fontSize.sm,
                fontWeight: THEME.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: THEME.transitions.normal,
                fontFamily: THEME.typography.fontFamily,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.colors.active}
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: THEME.colors.overlayLight,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: THEME.zIndex.modal
        }}>
          <div style={{
            backgroundColor: THEME.colors.cardBg,
            padding: THEME.spacing.xxxl,
            borderRadius: THEME.borderRadius.lg,
            maxWidth: '400px',
            boxShadow: THEME.shadows.xl,
            border: `1px solid ${THEME.colors.border}`,
            fontFamily: THEME.typography.fontFamily,
          }}>
            <h3 style={{ 
              margin: `0 0 ${THEME.spacing.lg} 0`, 
              color: THEME.colors.text,
              fontSize: THEME.typography.fontSize.lg,
              fontWeight: THEME.typography.fontWeight.semibold
            }}>
              ⚠️ Confirm Delete All
            </h3>
            <p style={{ 
              color: THEME.colors.textMuted, 
              marginBottom: THEME.spacing.xxl,
              fontSize: THEME.typography.fontSize.sm,
              lineHeight: THEME.typography.lineHeight.normal
            }}>
              This will permanently delete all {articles.length} cached articles. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: THEME.spacing.sm, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
                  backgroundColor: THEME.colors.active,
                  color: THEME.colors.text,
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: THEME.typography.fontSize.sm,
                  fontWeight: THEME.typography.fontWeight.medium,
                  transition: THEME.transitions.normal,
                  fontFamily: THEME.typography.fontFamily,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.colors.active}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
                  backgroundColor: THEME.colors.error,
                  color: THEME.colors.white,
                  border: 'none',
                  borderRadius: THEME.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: THEME.typography.fontSize.sm,
                  fontWeight: THEME.typography.fontWeight.medium,
                  transition: THEME.transitions.normal,
                  fontFamily: THEME.typography.fontFamily,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.errorHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.colors.error}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      {articles.length > 0 && (
        <div style={{ marginBottom: THEME.spacing.lg }}>
          <input
            type="text"
            placeholder="🔍 Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: THEME.spacing.md,
              fontSize: THEME.typography.fontSize.sm,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.md,
              outline: 'none',
              color: THEME.colors.text,
              backgroundColor: THEME.colors.background,
              fontFamily: THEME.typography.fontFamily,
            }}
          />
        </div>
      )}

      {/* Articles List */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        border: `1px solid ${THEME.colors.border}`,
        borderRadius: THEME.borderRadius.md,
        backgroundColor: THEME.colors.background
      }}>
        {loading ? (
          <div style={{ 
            padding: THEME.spacing.xxxl,
            textAlign: 'center',
            color: THEME.colors.textMuted,
            fontSize: THEME.typography.fontSize.sm
          }}>
            Loading articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={{ 
            padding: THEME.spacing.xxxl,
            textAlign: 'center',
            color: THEME.colors.textMuted
          }}>
            {searchQuery ? (
              <>
                <p style={{ margin: 0, fontSize: THEME.typography.fontSize.md }}>🔍 No articles found</p>
                <p style={{ margin: `${THEME.spacing.sm} 0 0 0`, fontSize: THEME.typography.fontSize.sm }}>
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: THEME.typography.fontSize.md }}>📝 No articles yet</p>
                <p style={{ margin: `${THEME.spacing.sm} 0 0 0`, fontSize: THEME.typography.fontSize.sm }}>
                  Articles you process will appear here
                </p>
              </>
            )}
          </div>
        ) : (
          <div>
            {filteredArticles.map((article, index) => (
              <div
                key={article.id}
                onClick={() => handleSelectArticle(article)}
                style={{
                  padding: THEME.spacing.lg,
                  borderBottom: index < filteredArticles.length - 1 ? `1px solid ${THEME.colors.border}` : 'none',
                  cursor: 'pointer',
                  transition: THEME.transitions.normal,
                  backgroundColor: THEME.colors.cardBg
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.colors.cardBg}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: THEME.spacing.sm
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: THEME.typography.fontSize.md,
                    fontWeight: THEME.typography.fontWeight.semibold,
                    color: THEME.colors.text,
                    flex: 1
                  }}>
                    {article.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteArticle(article.id, e)}
                    style={{
                      padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
                      backgroundColor: 'transparent',
                      color: THEME.colors.error,
                      border: 'none',
                      borderRadius: THEME.borderRadius.sm,
                      fontSize: THEME.typography.fontSize.sm,
                      cursor: 'pointer',
                      marginLeft: THEME.spacing.sm,
                      transition: THEME.transitions.normal
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.hover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Delete article"
                  >
                    🗑️
                  </button>
                </div>
                
                <p style={{
                  margin: `0 0 ${THEME.spacing.sm} 0`,
                  fontSize: THEME.typography.fontSize.sm,
                  color: THEME.colors.textMuted,
                  lineHeight: THEME.typography.lineHeight.normal
                }}>
                  {article.preview}
                </p>
                
                <div style={{
                  display: 'flex',
                  gap: THEME.spacing.lg,
                  fontSize: THEME.typography.fontSize.xs,
                  color: THEME.colors.textMuted
                }}>
                  <span>📅 {formatDate(article.timestamp)}</span>
                  <span>📝 {article.wordCount} words</span>
                  <span>🔤 {article.charCount} characters</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {filteredArticles.length > 0 && (
        <p style={{
          marginTop: THEME.spacing.lg,
          fontSize: THEME.typography.fontSize.xs,
          color: THEME.colors.textMuted,
          textAlign: 'center',
          margin: `${THEME.spacing.lg} 0 0 0`
        }}>
          Click on an article to load it into the editor
        </p>
      )}
    </div>
  );
}

