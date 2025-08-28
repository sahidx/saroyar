interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface QuestionGenerationRequest {
  subject: 'chemistry' | 'ict';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'mcq' | 'written' | 'both';
  count: number;
}

interface DoubtSolvingRequest {
  subject: 'chemistry' | 'ict';
  doubt: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }

  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

// Generate chemistry or ICT questions for teachers using Gemini
export async function generateQuestionsWithGemini(request: QuestionGenerationRequest): Promise<any> {
  const { subject, topic, difficulty, questionType, count } = request;

  const prompt = `As an expert ${subject} teacher, generate ${count} ${difficulty} level ${questionType === 'both' ? 'MCQ and written' : questionType} questions on the topic "${topic}".

${subject === 'chemistry' ? `
For Chemistry questions:
- Include molecular formulas, chemical equations, and reactions
- Cover concepts like atomic structure, bonding, thermodynamics, kinetics
- Use proper chemical nomenclature and notation
- Include balanced chemical equations where relevant
` : `
For ICT questions:
- Cover programming concepts, computer networks, databases, web development
- Include practical scenarios and real-world applications
- Focus on both theoretical knowledge and practical skills
- Include topics like algorithms, data structures, software engineering
`}

Format your response as JSON with this structure:
{
  "questions": [
    {
      "type": "mcq" | "written",
      "question": "question text",
      "options": ["A", "B", "C", "D"] (only for MCQ),
      "correctAnswer": "A" (only for MCQ),
      "explanation": "detailed explanation",
      "difficulty": "${difficulty}",
      "topic": "${topic}",
      "points": number
    }
  ]
}

Make questions challenging but appropriate for the ${difficulty} level. Include detailed explanations for each answer.`;

  try {
    const responseText = await callGeminiAPI(prompt);
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw new Error('Failed to generate questions with Gemini: ' + (error as Error).message);
  }
}

// Solve student doubts with detailed explanations using Gemini
export async function solveDoubtWithGemini(request: DoubtSolvingRequest): Promise<string> {
  const { subject, doubt, difficulty } = request;
  
  const studentLevel = difficulty === 'easy' ? 'beginner' : difficulty === 'medium' ? 'intermediate' : 'advanced';

  const prompt = `You are an expert ${subject} teacher helping a ${studentLevel} student. 

Student's question: "${doubt}"

${subject === 'chemistry' ? `
For Chemistry doubts:
- Provide step-by-step explanations with chemical equations
- Include molecular diagrams or structural formulas when relevant
- Explain the underlying concepts and principles
- Use examples and analogies to make concepts clear
- Include safety considerations if applicable
` : `
For ICT doubts:
- Provide clear, practical explanations with examples
- Include code snippets or algorithms when relevant
- Break down complex concepts into simpler parts
- Explain real-world applications and use cases
- Include best practices and common pitfalls
`}

Provide a comprehensive response that:
1. Directly answers the student's question
2. Explains the underlying concepts
3. Gives step-by-step solutions where applicable
4. Includes relevant examples
5. Suggests related topics for further learning

Please provide a clear, well-structured response in plain text format. Use headings, bullet points, and proper formatting to make it easy to read.`;

  try {
    return await callGeminiAPI(prompt);
  } catch (error) {
    console.error('Error solving doubt with Gemini:', error);
    throw new Error('Failed to solve doubt with Gemini: ' + (error as Error).message);
  }
}