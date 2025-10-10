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

// Color constants
const BACKGROUND_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const BORDER_COLOR = '#E5E7EB';
const DANGER_COLOR = '#EF4444';
const DANGER_HOVER_COLOR = '#DC2626';
const SECONDARY_COLOR = '#6B7280';
const LIGHT_BACKGROUND = '#F9FAFB';

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
      backgroundColor: BACKGROUND_COLOR,
      border: `1px solid ${BORDER_COLOR}`,
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600',
            color: TEXT_COLOR,
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            📚 Article History
          </h2>
          {stats && (
            <p style={{ 
              fontSize: '0.875rem', 
              color: SECONDARY_COLOR,
              margin: 0
            }}>
              {stats.totalArticles} article{stats.totalArticles !== 1 ? 's' : ''} • {stats.totalWords.toLocaleString()} words
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {articles.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: DANGER_COLOR,
                color: BACKGROUND_COLOR,
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DANGER_HOVER_COLOR}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DANGER_COLOR}
            >
              🗑️ Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: SECONDARY_COLOR,
                color: BACKGROUND_COLOR,
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: BACKGROUND_COLOR,
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: TEXT_COLOR }}>⚠️ Confirm Delete All</h3>
            <p style={{ color: SECONDARY_COLOR, marginBottom: '1.5rem' }}>
              This will permanently delete all {articles.length} cached articles. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: SECONDARY_COLOR,
                  color: BACKGROUND_COLOR,
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: DANGER_COLOR,
                  color: BACKGROUND_COLOR,
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      {articles.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: '0.375rem',
              outline: 'none',
              color: TEXT_COLOR
            }}
          />
        </div>
      )}

      {/* Articles List */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: '0.375rem',
        backgroundColor: LIGHT_BACKGROUND
      }}>
        {loading ? (
          <div style={{ 
            padding: '3rem',
            textAlign: 'center',
            color: SECONDARY_COLOR
          }}>
            Loading articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={{ 
            padding: '3rem',
            textAlign: 'center',
            color: SECONDARY_COLOR
          }}>
            {searchQuery ? (
              <>
                <p style={{ margin: 0, fontSize: '1rem' }}>🔍 No articles found</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: '1rem' }}>📝 No articles yet</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
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
                  padding: '1rem',
                  borderBottom: index < filteredArticles.length - 1 ? `1px solid ${BORDER_COLOR}` : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: BACKGROUND_COLOR
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BACKGROUND_COLOR}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: TEXT_COLOR,
                    flex: 1
                  }}>
                    {article.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteArticle(article.id, e)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'transparent',
                      color: DANGER_COLOR,
                      border: 'none',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      marginLeft: '0.5rem'
                    }}
                    title="Delete article"
                  >
                    🗑️
                  </button>
                </div>
                
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.875rem',
                  color: SECONDARY_COLOR,
                  lineHeight: '1.5'
                }}>
                  {article.preview}
                </p>
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.75rem',
                  color: SECONDARY_COLOR
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
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: SECONDARY_COLOR,
          textAlign: 'center',
          margin: '1rem 0 0 0'
        }}>
          Click on an article to load it into the editor
        </p>
      )}
    </div>
  );
}

