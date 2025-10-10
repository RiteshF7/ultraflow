import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@/lib/AIEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type = 'generate', messages, action } = body;

    // Handle model checking action
    if (action === 'check-models') {
      try {
        const models = await AIEngine.getModelsForProvider('gemini');
        return NextResponse.json({
          models,
          success: true
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to fetch available models' },
          { status: 500 }
        );
      }
    }

    if (!prompt && !messages) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'generate':
      default:
        // Use the new AI Engine for single-shot requests
        result = await AIEngine.askAI(prompt);
        break;
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: result.text,
      success: true
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

