// Dynamic Grading System Configuration
// This file manages grading schemes and calculation logic

export interface GradeRange {
  letter: string;        // A+, A, A-, B, C, D, F
  minPercent: number;    // Minimum percentage for this grade
  maxPercent: number;    // Maximum percentage for this grade  
  gpa: number;          // GPA value (5.0, 4.0, 3.5, etc.)
  color: string;        // CSS color class for frontend display
  description: string;   // Bengali description for performance message
}

export interface GradingScheme {
  id: string;
  name: string;
  description?: string;
  gradeRanges: GradeRange[];
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
}

// Default Bangladesh NCTB Grading Scheme
export const BANGLADESH_NCTB_SCHEME: GradingScheme = {
  id: 'bangladesh-nctb',
  name: 'Bangladesh NCTB Standard',
  description: 'Standard grading system used in Bangladesh education (NCTB)',
  gradeRanges: [
    {
      letter: 'A+',
      minPercent: 80,
      maxPercent: 100,
      gpa: 5.0,
      color: 'bg-green-500 text-white',
      description: '🎉 অসাধারণ! চমৎকার ফলাফল!'
    },
    {
      letter: 'A',
      minPercent: 70,
      maxPercent: 79,
      gpa: 4.0,
      color: 'bg-blue-500 text-white',
      description: '👏 খুবই ভালো! অভিনন্দন!'
    },
    {
      letter: 'A-',
      minPercent: 60,
      maxPercent: 69,
      gpa: 3.5,
      color: 'bg-cyan-500 text-white',
      description: '👍 ভালো ফলাফল! আরো চেষ্টা করুন।'
    },
    {
      letter: 'B',
      minPercent: 50,
      maxPercent: 59,
      gpa: 3.0,
      color: 'bg-yellow-500 text-white',
      description: '📊 গ্রহণযোগ্য ফলাফল! আরো চেষ্টা করুন।'
    },
    {
      letter: 'C',
      minPercent: 40,
      maxPercent: 49,
      gpa: 2.0,
      color: 'bg-orange-500 text-white',
      description: '📚 পাস! আরো অধ্যয়ন প্রয়োজন।'
    },
    {
      letter: 'D',
      minPercent: 33,
      maxPercent: 39,
      gpa: 1.0,
      color: 'bg-red-400 text-white',
      description: '⚠️ মোটামুটি! আরো পড়াশোনা করুন।'
    },
    {
      letter: 'F',
      minPercent: 0,
      maxPercent: 32,
      gpa: 0.0,
      color: 'bg-red-600 text-white',
      description: '💪 আরো চেষ্টা করুন। পরবর্তীতে ভালো করবেন।'
    }
  ],
  isActive: true,
  isDefault: true,
  createdBy: 'system'
};

// Calculate grade from percentage using a grading scheme
export function calculateGradeFromPercentage(percentage: number, gradingScheme: GradingScheme): GradeRange {
  // Sort grades by minPercent in descending order to check highest grades first
  const sortedGrades = [...gradingScheme.gradeRanges].sort((a, b) => b.minPercent - a.minPercent);
  
  for (const grade of sortedGrades) {
    if (percentage >= grade.minPercent && percentage <= grade.maxPercent) {
      return grade;
    }
  }
  
  // Fallback to F grade if no match found
  return gradingScheme.gradeRanges.find(g => g.letter === 'F') || sortedGrades[sortedGrades.length - 1];
}

// Get performance message from grade
export function getPerformanceMessage(percentage: number, gradingScheme: GradingScheme): string {
  const grade = calculateGradeFromPercentage(percentage, gradingScheme);
  return `${grade.description} (${grade.letter} - GPA ${grade.gpa})`;
}

// Get grade color CSS class
export function getGradeColor(gradeLetter: string, gradingScheme: GradingScheme): string {
  const grade = gradingScheme.gradeRanges.find(g => g.letter === gradeLetter);
  return grade?.color || 'bg-gray-500 text-white';
}

// Calculate grade distribution statistics
export function calculateGradeDistribution(results: Array<{marks: number}>, totalMarks: number, gradingScheme: GradingScheme) {
  const distribution: Record<string, number> = {};
  
  // Initialize all grade counters to 0
  gradingScheme.gradeRanges.forEach(grade => {
    distribution[grade.letter.toLowerCase().replace('+', 'Plus').replace('-', 'Minus')] = 0;
  });
  
  // Count students in each grade
  results.forEach(result => {
    const percentage = Math.round((result.marks / totalMarks) * 100);
    const grade = calculateGradeFromPercentage(percentage, gradingScheme);
    const key = grade.letter.toLowerCase().replace('+', 'Plus').replace('-', 'Minus');
    distribution[key]++;
  });
  
  // Calculate pass rate (all grades except F)
  const passedStudents = results.filter(result => {
    const percentage = Math.round((result.marks / totalMarks) * 100);
    const grade = calculateGradeFromPercentage(percentage, gradingScheme);
    return grade.letter !== 'F';
  }).length;
  
  return {
    ...distribution,
    passedStudents
  };
}

// Get default grading scheme (can be overridden later with database lookup)
export function getDefaultGradingScheme(): GradingScheme {
  return BANGLADESH_NCTB_SCHEME;
}