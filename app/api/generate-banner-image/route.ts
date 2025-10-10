import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, customPrompt } = body;

    // Validate input
    if (!prompt && !customPrompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'API key not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);

    const finalPrompt = customPrompt || prompt;
    console.log('🎨 Generating banner image with prompt:', finalPrompt.substring(0, 100) + '...');

    // Note: Image generation is currently not supported in the standard Generative AI SDK
    // This endpoint may need to use a different API or the Imagen API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;

    // Extract image data from response
    let imageData: string | null = null;
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            console.log('Text response:', part.text);
          } else if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            console.log('✅ Image generated successfully');
            break;
          }
        }
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'No image data returned from API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageData,
    });

  } catch (error) {
    console.error('❌ Banner Image Generation Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error during image generation' },
      { status: 500 }
    );
  }
}

