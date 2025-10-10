'use client';

import { useState, useEffect } from 'react';
import ResultsGridModern from '@/components/product/ResultsGridModern';

interface DiagramData {
  title: string;
  mermaidCode: string;
}

export default function ResultsPage() {
  const [diagrams, setDiagrams] = useState<DiagramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load diagrams from localStorage
    const loadDiagrams = () => {
      try {
        console.log('=== LOADING DIAGRAMS FROM LOCALSTORAGE ===');
        const storedDiagrams = localStorage.getItem('generated-diagrams');
        console.log('📦 Raw storage data:', storedDiagrams);
        
        if (storedDiagrams) {
          const parsed = JSON.parse(storedDiagrams);
          console.log('📦 Parsed diagrams:', parsed);
          console.log('📦 Type:', Array.isArray(parsed) ? 'Array' : typeof parsed);
          console.log('📦 Length:', parsed?.length);
          
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDiagrams(parsed);
            console.log('✅ Diagrams loaded successfully:', parsed.length);
          } else {
            console.warn('⚠️ No diagrams found or invalid format');
            setError('No diagrams found. Please generate some flowcharts first.');
          }
        } else {
          console.warn('⚠️ No stored diagrams found in localStorage');
          setError('No diagrams found. Please generate some flowcharts first.');
        }
      } catch (err) {
        console.error('❌ Error loading diagrams:', err);
        setError('Failed to load diagrams. Please try generating them again.');
      } finally {
        setLoading(false);
      }
    };

    loadDiagrams();
  }, []);

  return (
    <ResultsGridModern
      diagrams={diagrams}
      loading={loading}
      error={error}
    />
  );
}

