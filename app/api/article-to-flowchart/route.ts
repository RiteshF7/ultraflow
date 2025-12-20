/**
 * API Route: Convert Article to Flowchart (MMD Code)
 * POST /api/article-to-flowchart
 * 
 * Pipeline:
 * 1. Article → Structured Data
 * 2. Structured Data → MMD
 * 3. Return MMD (rendering happens client-side)
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeArticleToFlowChart } from '@/lib/ArticleToFlowChart/articleToFlowChartExecutor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { article, themeInstructions, count } = body;

    if (!article || typeof article !== 'string') {
      return NextResponse.json(
        { error: 'Article text is required' },
        { status: 400 }
      );
    }

    if (article.trim().length < 10) {
      return NextResponse.json(
        { error: 'Article text is too short (minimum 10 characters)' },
        { status: 400 }
      );
    }

    // Default to 1 if not specified, verify range
    const diagramCount = count ? Math.max(1, Math.min(10, parseInt(count))) : 3;

    // Execute the pipeline (article -> diagrams in one AI call)
    const result = await executeArticleToFlowChart(article, themeInstructions || '', diagramCount);

    return NextResponse.json({
      success: true,
      step1: {
        diagrams: result.step1.diagrams,
        diagramCount: result.step1.count
      },
      step2: {
        diagrams: result.step2.diagrams,
        diagramCount: result.step2.count
      }
    });
  } catch (error) {
    console.error('Error processing article:', error);

    return NextResponse.json(
      {
        error: 'Failed to process article',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

