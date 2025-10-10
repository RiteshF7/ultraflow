/**
 * API Route: Apply Theme to Existing Mermaid Diagram using AI
 * POST /api/apply-theme-to-diagram
 * 
 * Takes an existing Mermaid diagram and applies theme styling using AI.
 * The AI regenerates the diagram with the theme applied while preserving structure.
 * 
 * Benefits:
 * - More flexible styling options (can use gradients, custom styles)
 * - AI can intelligently apply theme to different node types
 * - Can follow sample themed code as reference
 * - Preserves all content and structure
 */

import { NextRequest, NextResponse } from 'next/server';
import { PRESET_THEMES, type ThemeConfig, generateThemePrompt } from '@/lib/promptmanager/Prompts/PromptThemeTemplate';
import { promptManager } from '@/lib/promptmanager';

/**
 * Generate sample themed Mermaid code as reference
 * Creates a simple 2-node diagram with the theme applied
 */
function generateSampleThemedCode(themeConfig: ThemeConfig): string {
  const {
    fontName = 'Arial',
    textColor = '#000000',
    textSize = 14,
    arrowColor = '#333333',
    boxContainerColor = '#FFFFFF',
    containerBoxBorderColor = '#000000',
    userAdditionalCustomPrompt = ''
  } = themeConfig;

  // Check if this is the gradient-dark theme that needs special handling
  if (userAdditionalCustomPrompt && userAdditionalCustomPrompt.includes('gradient')) {
    return `%%{init: {'flowchart': {'nodeSpacing': 50, 'rankSpacing': 80, 'curve': 'basis'}}}%%
flowchart TD
    A["<div style='background: linear-gradient(135deg, ${boxContainerColor} 0%, ${containerBoxBorderColor} 100%); border-radius: 10px; padding: 12px 24px; color: ${textColor}; text-align: center; font-family: ${fontName}; font-size: ${textSize}px; border: 2px solid ${containerBoxBorderColor};'>Sample Node 1</div>"] 
    --> 
    B["<div style='background: linear-gradient(135deg, ${boxContainerColor} 0%, ${containerBoxBorderColor} 100%); border-radius: 10px; padding: 12px 24px; color: ${textColor}; text-align: center; font-family: ${fontName}; font-size: ${textSize}px; border: 2px solid ${containerBoxBorderColor};'>Sample Node 2</div>"]
    
    classDef noBorder fill:none,stroke:none,stroke-width:0px
    class A,B noBorder
    
    linkStyle default stroke:${arrowColor},stroke-width:2px`;
  }

  // Standard theme with init directive
  return `%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'${boxContainerColor}', 'primaryTextColor':'${textColor}', 'primaryBorderColor':'${containerBoxBorderColor}', 'lineColor':'${arrowColor}', 'fontSize':'${textSize}px', 'fontFamily':'${fontName}'}}}%%
flowchart TD
    A["Sample Node 1"] --> B["Sample Node 2"]
    
    style A fill:${boxContainerColor},stroke:${containerBoxBorderColor},stroke-width:2px,color:${textColor}
    style B fill:${boxContainerColor},stroke:${containerBoxBorderColor},stroke-width:2px,color:${textColor}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mermaidCode, diagramTitle, themePreset, customThemeConfig } = body;

    // Validate inputs
    if (!mermaidCode || typeof mermaidCode !== 'string') {
      return NextResponse.json(
        { error: 'Mermaid code is required' },
        { status: 400 }
      );
    }

    if (mermaidCode.trim().length < 10) {
      return NextResponse.json(
        { error: 'Mermaid code is too short' },
        { status: 400 }
      );
    }

    console.log('🎨 Applying theme to diagram using AI:', diagramTitle || 'Untitled');
    console.log('📊 Original Mermaid code length:', mermaidCode.length);
    console.log('🎨 Theme preset:', themePreset);
    console.log('🎨 Custom theme config:', customThemeConfig);

    // Apply theme using AI with the PromptApplyThemeToMermaid
    let themedMermaidCode: string;
    
    if (customThemeConfig && customThemeConfig.customInstructions) {
      // Use custom instructions from the user
      console.log('🎨 Applying custom AI instructions:', customThemeConfig.customInstructions);
      
      const themeInstructions = customThemeConfig.customInstructions;
      const sampleThemedCode = customThemeConfig.sampleThemedCode || '';
      
      console.log('📝 Custom instructions length:', themeInstructions.length);
      if (sampleThemedCode) {
        console.log('📝 Sample code provided, length:', sampleThemedCode.length);
      }
      
      // Execute the PromptApplyThemeToMermaid with AI
      console.log('🤖 Calling AI to apply custom instructions...');
      
      try {
        themedMermaidCode = await promptManager.executePrompt(
          'apply-theme-to-mermaid',  // Prompt ID
          {
            variables: {
              mermaidCode: mermaidCode.trim(),
              themeInstructions,
              sampleThemedCode
            },
            aiConfig: {
              temperature: 0.3,  // Low temperature for consistent styling
              maxTokens: 8192
            }
          }
        );
        
        console.log('✅ AI custom instructions applied');
        console.log('📊 Themed code length:', themedMermaidCode.length);
        console.log('📊 Preview:', themedMermaidCode.substring(0, 300));
        
      } catch (aiError) {
        console.error('❌ AI instruction application failed:', aiError);
        throw new Error(`AI failed to apply instructions: ${aiError instanceof Error ? aiError.message : 'Unknown AI error'}`);
      }
      
    } else if (themePreset && PRESET_THEMES[themePreset as keyof typeof PRESET_THEMES]) {
      // Use preset theme - apply using AI for intelligent styling
      const themeConfig = PRESET_THEMES[themePreset as keyof typeof PRESET_THEMES];
      console.log('🎨 Applying theme preset using AI:', themePreset);
      
      // Generate theme instructions
      const themeInstructions = generateThemePrompt(themeConfig);
      console.log('📝 Theme instructions generated, length:', themeInstructions.length);
      
      // Generate sample themed code as reference (high priority)
      const sampleThemedCode = generateSampleThemedCode(themeConfig);
      console.log('📝 Sample themed code generated, length:', sampleThemedCode.length);
      
      // Execute the PromptApplyThemeToMermaid with AI
      console.log('🤖 Calling AI to apply theme...');
      
      try {
        themedMermaidCode = await promptManager.executePrompt(
          'apply-theme-to-mermaid',  // Prompt ID
          {
            variables: {
              mermaidCode: mermaidCode.trim(),
              themeInstructions,
              sampleThemedCode
            },
            aiConfig: {
              temperature: 0.3,  // Low temperature for consistent styling
              maxTokens: 8192
            }
          }
        );
        
        console.log('✅ AI theme application completed');
        console.log('📊 Themed code length:', themedMermaidCode.length);
        console.log('📊 Preview:', themedMermaidCode.substring(0, 300));
        
      } catch (aiError) {
        console.error('❌ AI theme application failed:', aiError);
        throw new Error(`AI failed to apply theme: ${aiError instanceof Error ? aiError.message : 'Unknown AI error'}`);
      }
      
    } else {
      // No preset or custom instructions - return original code
      console.log('⚠️ No theme preset or custom instructions provided, returning original code');
      themedMermaidCode = mermaidCode.trim();
    }

    // Clean up the AI response - remove markdown code blocks if present
    let cleanedCode = themedMermaidCode.trim();
    
    // Remove markdown code blocks (```mermaid ... ``` or ``` ... ```)
    cleanedCode = cleanedCode
      .replace(/^```(?:mermaid)?\s*\n/gm, '')
      .replace(/\n```\s*$/gm, '')
      .replace(/^```(?:mermaid)?\s*/gm, '')
      .replace(/```\s*$/gm, '')
      .trim();

    console.log('🧹 Cleaned code length:', cleanedCode.length);

    return NextResponse.json({
      success: true,
      mermaidCode: cleanedCode,
      title: diagramTitle || 'Themed Diagram',
      metadata: {
        originalLength: mermaidCode.length,
        themedLength: cleanedCode.length,
        themeApplied: !!themePreset,
        method: 'ai-regeneration'  // Indicates we used AI to apply theme
      }
    });

  } catch (error) {
    console.error('❌ Error applying theme to diagram:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to apply theme to diagram',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

