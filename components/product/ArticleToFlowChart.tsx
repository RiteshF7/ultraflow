'use client';

import { useState, useEffect } from 'react';
import InputArticleModern from './InputArticleModern';
import LoadingOverlay from './LoadingOverlay';

interface DiagramData {
  title: string;
  mermaidCode: string;
}

export default function ArticleToFlowChart() {
  // Form state
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shouldProcess, setShouldProcess] = useState(false);

  // Process article when shouldProcess flag is set
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

        // Get diagrams from the new API response format
        const diagramsData: DiagramData[] = data.step2.diagrams || [];
        console.log('Generated', diagramsData.length, 'diagram(s)');
        console.log('Full diagrams data:', diagramsData);
        
        diagramsData.forEach((diagram, i) => {
          console.log(`  ${i + 1}. ${diagram.title}`);
          console.log(`     Mermaid code length: ${diagram.mermaidCode?.length || 0}`);
        });
        
        if (diagramsData.length === 0) {
          throw new Error('No diagrams were generated from the article');
        }
        
        console.log('=== STORING DIAGRAMS AND NAVIGATING TO RESULTS ===');
        console.log('📦 Diagrams to store:', diagramsData);
        console.log('📦 Number of diagrams:', diagramsData.length);
        
        // Store diagrams in localStorage
        localStorage.setItem('generated-diagrams', JSON.stringify(diagramsData));
        
        // Navigate to results page
        window.location.href = '/results';
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    processArticle();
    setShouldProcess(false);
  }, [shouldProcess, article]);

  const handleNext = () => {
    setShouldProcess(true);
  };

  return (
    <>
      {/* Global Loading Overlay */}
      <LoadingOverlay 
        isLoading={loading} 
        message="Processing your article..."
      />
      
      <InputArticleModern
        article={article}
        setArticle={setArticle}
        loading={loading}
        error={error}
        onNext={handleNext}
      />
    </>
  );
}
