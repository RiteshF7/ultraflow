/**
 * Article Cache Utility
 * 
 * Client-side local storage for articles using IndexedDB.
 * Stores article text, metadata, and allows retrieval of previously used articles.
 */

export interface CachedArticle {
  id: string;
  title: string;
  content: string;
  preview: string;
  timestamp: number;
  dateCreated: string;
  wordCount: number;
  charCount: number;
}

const DB_NAME = 'ArticleFlowChartDB';
const STORE_NAME = 'articles';
const DB_VERSION = 1;

/**
 * Initialize IndexedDB
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('title', 'title', { unique: false });
      }
    };
  });
}

/**
 * Generate a unique ID for an article
 */
function generateArticleId(): string {
  return `article_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate title from article content
 */
function generateTitle(content: string): string {
  // Take first line or first 50 characters
  const firstLine = content.trim().split('\n')[0];
  const title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
  return title || 'Untitled Article';
}

/**
 * Generate preview from article content
 */
function generatePreview(content: string, maxLength: number = 150): string {
  const cleaned = content.trim().replace(/\s+/g, ' ');
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Save an article to cache
 */
export async function saveArticle(content: string, customTitle?: string): Promise<CachedArticle> {
  if (!content || content.trim().length === 0) {
    throw new Error('Article content cannot be empty');
  }

  const db = await openDatabase();
  
  const article: CachedArticle = {
    id: generateArticleId(),
    title: customTitle || generateTitle(content),
    content: content.trim(),
    preview: generatePreview(content),
    timestamp: Date.now(),
    dateCreated: new Date().toISOString(),
    wordCount: countWords(content),
    charCount: content.trim().length
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(article);

    request.onsuccess = () => resolve(article);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all articles from cache, sorted by timestamp (newest first)
 */
export async function getAllArticles(): Promise<CachedArticle[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const articles = request.result as CachedArticle[];
      // Sort by timestamp, newest first
      articles.sort((a, b) => b.timestamp - a.timestamp);
      resolve(articles);
    };
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get a specific article by ID
 */
export async function getArticleById(id: string): Promise<CachedArticle | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Delete an article by ID
 */
export async function deleteArticle(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Update an existing article
 */
export async function updateArticle(article: CachedArticle): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(article);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Search articles by title or content
 */
export async function searchArticles(query: string): Promise<CachedArticle[]> {
  const allArticles = await getAllArticles();
  
  if (!query || query.trim().length === 0) {
    return allArticles;
  }

  const lowerQuery = query.toLowerCase();
  
  return allArticles.filter(article => 
    article.title.toLowerCase().includes(lowerQuery) ||
    article.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Clear all articles from cache
 */
export async function clearAllArticles(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalArticles: number;
  totalWords: number;
  totalCharacters: number;
  oldestArticle: Date | null;
  newestArticle: Date | null;
}> {
  const articles = await getAllArticles();

  if (articles.length === 0) {
    return {
      totalArticles: 0,
      totalWords: 0,
      totalCharacters: 0,
      oldestArticle: null,
      newestArticle: null
    };
  }

  return {
    totalArticles: articles.length,
    totalWords: articles.reduce((sum, a) => sum + a.wordCount, 0),
    totalCharacters: articles.reduce((sum, a) => sum + a.charCount, 0),
    oldestArticle: new Date(articles[articles.length - 1].timestamp),
    newestArticle: new Date(articles[0].timestamp)
  };
}

/**
 * Export articles as JSON
 */
export async function exportArticlesAsJSON(): Promise<string> {
  const articles = await getAllArticles();
  return JSON.stringify(articles, null, 2);
}

/**
 * Import articles from JSON
 */
export async function importArticlesFromJSON(jsonString: string): Promise<number> {
  const articles = JSON.parse(jsonString) as CachedArticle[];
  const db = await openDatabase();
  let importedCount = 0;

  for (const article of articles) {
    try {
      await new Promise<void>((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(article);

        request.onsuccess = () => {
          importedCount++;
          resolve();
        };
        request.onerror = () => resolve(); // Skip duplicates
        
        transaction.oncomplete = () => resolve();
      });
    } catch (error) {
      console.error('Error importing article:', error);
    }
  }

  db.close();
  return importedCount;
}

