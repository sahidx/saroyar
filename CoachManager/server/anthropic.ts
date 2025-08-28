import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate questions using Claude AI
export async function generateQuestions(topic: string, subject: string, count: number, difficulty: string): Promise<any> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return sample questions if no API key
      const sampleQuestions = [];
      for (let i = 0; i < count; i++) {
        sampleQuestions.push({
          questionText: `Sample ${subject} question ${i + 1} about ${topic} (${difficulty} level)`,
          questionType: 'mcq',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          marks: 2
        });
      }
      return sampleQuestions;
    }

    const prompt = `Generate ${count} ${difficulty} level multiple choice questions about ${topic} in ${subject}. 
    
For ${subject === 'chemistry' ? 'Chemistry' : 'ICT'} questions:
${subject === 'chemistry' 
  ? '- Include molecular formulas, chemical equations, and reactions\n- Cover concepts like atomic structure, bonding, thermodynamics\n- Use proper chemical nomenclature' 
  : '- Cover programming, networks, databases, web development\n- Include practical scenarios and real-world applications\n- Focus on both theoretical and practical skills'
}

Return only a JSON array of questions in this exact format:
[
  {
    "questionText": "Question text here?",
    "questionType": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "marks": 2
  }
]`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = (response.content[0] as any).text;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid AI response format');
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    // Return sample questions as fallback
    const sampleQuestions = [];
    for (let i = 0; i < count; i++) {
      sampleQuestions.push({
        questionText: `Sample ${subject} question ${i + 1} about ${topic} (${difficulty} level)`,
        questionType: 'mcq',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        marks: 2
      });
    }
    return sampleQuestions;
  }
}

// Solve student doubts using Claude AI
export async function solveDoubt(question: string, subject: string): Promise<string> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return `Sample solution for your ${subject} question: "${question}". The AI would provide a detailed step-by-step explanation here with proper formulas and concepts.`;
    }

    const prompt = `As an expert ${subject} teacher, solve this student's doubt:

Question: ${question}

Provide a clear, step-by-step explanation that includes:
${subject === 'chemistry' 
  ? '- Chemical formulas and equations if relevant\n- Conceptual explanations\n- Real-world applications\n- Safety considerations if applicable' 
  : '- Code examples if relevant\n- Technical concepts\n- Practical applications\n- Best practices'
}

Make it educational and easy to understand for a student.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    return (response.content[0] as any).text;
  } catch (error) {
    console.error('Error solving doubt:', error);
    return `Sample solution for your ${subject} question: "${question}". The AI would provide a detailed step-by-step explanation here with proper formulas and concepts.`;
  }
}