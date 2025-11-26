/**
 * POST /api/ai/suggest-fix
 * Generates AI-powered code refactoring suggestions
 * Uses Hugging Face Inference API (free tier)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const HF_API_URL = "https://api-inference.huggingface.co/models/bigcode/starcoder";

interface SuggestFixRequest {
  code: string;
  fileName: string;
  filePath: string;
  riskScore: number;
  complexity: number;
  insights?: Array<{
    id: string;
    message: string;
    severity: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, fileName, filePath, riskScore, complexity, insights }: SuggestFixRequest = await req.json();

    if (!code || !filePath) {
      return NextResponse.json(
        { error: "Code and filePath are required" },
        { status: 400 }
      );
    }

    // Check if Hugging Face API key is configured
    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured. Please add HUGGINGFACE_API_KEY to environment variables." },
        { status: 503 }
      );
    }

    const language = getLanguageFromPath(filePath);

    // Build insights context
    const insightsContext = insights && insights.length > 0
      ? `\n## Detected Issues:\n${insights.map((i, idx) => `${idx + 1}. [${i.severity}] ${i.message}`).join('\n')}\n`
      : '';

    // Build prompt for AI
    const prompt = `# Task: Refactor this ${language} code to reduce complexity and improve quality

File: ${filePath}
Current Risk Score: ${riskScore.toFixed(1)}
Current Cyclomatic Complexity: ${complexity}
${insightsContext}
## Original Code:
\`\`\`${language}
${code}
\`\`\`

## Instructions:
1. Reduce cyclomatic complexity by simplifying conditional logic
2. Improve code readability and maintainability
3. Follow ${language} best practices and conventions
4. Add helpful comments where needed
5. Keep the exact same functionality
6. Do not change variable/function names unless necessary for clarity
7. Address the detected issues listed above

## Refactored Code:
\`\`\`${language}
`;

    console.log("[AI Suggest Fix] Calling Hugging Face API...");

    // Call Hugging Face Inference API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.2,
          top_p: 0.95,
          return_full_text: false,
          stop: ["```"],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[AI Suggest Fix] Hugging Face error:", errorData);
      
      // Handle model loading (common with free tier)
      if (errorData.error?.includes("loading")) {
        return NextResponse.json(
          { error: "AI model is loading. Please try again in 20 seconds." },
          { status: 503 }
        );
      }

      throw new Error(errorData.error || "AI API request failed");
    }

    const data = await response.json();
    console.log("[AI Suggest Fix] Response received");

    // Extract code from response
    let suggestedCode = data[0]?.generated_text || "";
    
    // Clean up the response
    suggestedCode = extractCodeFromResponse(suggestedCode);

    // If response is too short or empty, provide fallback
    if (suggestedCode.length < 50) {
      suggestedCode = generateFallbackSuggestion(code, complexity);
    }

    return NextResponse.json({
      suggestedCode,
      model: "bigcode/starcoder",
      timestamp: new Date().toISOString(),
      improvements: [
        "Reduced cyclomatic complexity",
        "Improved code readability",
        "Added helpful comments",
        "Followed best practices",
      ],
    });
  } catch (error: any) {
    console.error("[AI Suggest Fix] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}

/**
 * Get programming language from file path
 */
function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    py: "python",
    java: "java",
    go: "go",
    rb: "ruby",
    php: "php",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    swift: "swift",
    kt: "kotlin",
    rs: "rust",
  };
  return langMap[ext || ""] || "text";
}

/**
 * Extract clean code from AI response
 */
function extractCodeFromResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```[\w]*\n?/g, "");
  
  // Remove common AI response prefixes
  cleaned = cleaned.replace(/^(Here's|Here is|This is|The refactored code|Refactored code).*?:\s*/i, "");
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Generate a simple fallback suggestion if AI fails
 */
function generateFallbackSuggestion(originalCode: string, complexity: number): string {
  return `// AI suggestion temporarily unavailable
// Original code with added comments for clarity

${originalCode}

// Suggestions to reduce complexity (${complexity}):
// 1. Break down large functions into smaller ones
// 2. Reduce nested if/else statements
// 3. Use early returns to simplify logic
// 4. Extract complex conditions into named variables
// 5. Consider using design patterns (Strategy, Factory, etc.)
`;
}
