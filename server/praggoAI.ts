import { GoogleGenAI } from "@google/genai";

// Praggo AI - 5 Hardcoded API Key Rotation System for VPS Production
// Automatic rotation on quota limits with instant fallback

class PraggoAIService {
  private static instance: PraggoAIService;
  
  // 5 HARDCODED GEMINI API KEYS - PRODUCTION READY
  private readonly API_KEYS = [
    "AIzaSyABdNCR_6wfhSOUJoGPWpSqUTWOGtbbBiQ", // Key 1 - Primary
    "ADD_YOUR_SECOND_KEY_HERE",                    // Key 2 - Backup
    "ADD_YOUR_THIRD_KEY_HERE",                     // Key 3 - Backup  
    "ADD_YOUR_FOURTH_KEY_HERE",                    // Key 4 - Backup
    "ADD_YOUR_FIFTH_KEY_HERE"                      // Key 5 - Backup
  ];
  
  private currentKeyIndex = 0;
  private readonly modelName = 'gemini-2.0-flash-exp';
  private readonly maxRetries = 5;

  private constructor() {
    this.initializeKeys();
  }

  static getInstance(): PraggoAIService {
    if (!PraggoAIService.instance) {
      PraggoAIService.instance = new PraggoAIService();
    }
    return PraggoAIService.instance;
  }

  private initializeKeys() {
    // Check if keys are properly configured
    const validKeys = this.API_KEYS.filter(key => 
      key && key.length > 30 && !key.includes('_HERE')
    );
    
    if (validKeys.length === 0) {
      console.warn('⚠️ Praggo AI: No valid API keys configured. Replace placeholder keys in API_KEYS array.');
    } else {
      console.log(`🎓 Praggo AI Enhanced System: ${validKeys.length}/5 keys active with rotation`);
      console.log('📚 NCTB Curriculum • University Admission • Bengali AI Support');
    }
  }

  private getCurrentKey(): string | null {
    const key = this.API_KEYS[this.currentKeyIndex];
    return (key && key.length > 30 && !key.includes('_HERE')) ? key : null;
  }

  private getClient(): GoogleGenAI | null {
    const key = this.getCurrentKey();
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
  }

  private rotateToNextKey(): boolean {
    const oldIndex = this.currentKeyIndex;
    
    // Try to find next valid key
    for (let i = 1; i <= this.maxRetries; i++) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.API_KEYS.length;
      if (this.getCurrentKey()) {
        console.log(`🔄 Praggo AI rotated: Key #${oldIndex + 1} → Key #${this.currentKeyIndex + 1}`);
        return true;
      }
    }
    
    console.warn('⚠️ All Praggo AI keys exhausted or invalid');
    return false;
  }

  private isQuotaError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStatus = error?.status || error?.code;
    
    return (
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('limit exceeded') ||
      errorMessage.includes('resource exhausted') ||
      errorStatus === 429 ||
      errorStatus === 403
    );
  }

  // Compatibility method - no longer needed but kept for existing code
  async refreshKeys() {
    this.initializeKeys();
  }

  // Main API call method with 5-key rotation and error handling
  async makeAPICall(
    prompt: string,
    userId: string,
    userRole: 'teacher' | 'student',
    requestType: 'generate_questions' | 'solve_doubt',
    subject: 'science' | 'math'
  ): Promise<string> {
    let attempt = 0;
    let lastError: any = null;

    while (attempt < this.maxRetries) {
      const genAI = this.getClient();
      if (!genAI) {
        throw new Error('Praggo AI এর জন্য বৈধ Gemini API key সেট করা হয়নি।');
      }

      try {
        console.log(`🤖 Praggo AI attempt ${attempt + 1}/${this.maxRetries} using Key #${this.currentKeyIndex + 1}`);
        
        const response = await genAI.models.generateContent({
          model: this.modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        // Parse response from various possible formats
        const anyResp: any = response as any;
        let result: string = '';
        
        if (typeof anyResp.text === 'function') {
          result = anyResp.text();
        } else if (typeof anyResp.text === 'string') {
          result = anyResp.text;
        } else if (anyResp.candidates?.[0]?.content?.parts?.[0]?.text) {
          result = anyResp.candidates[0].content.parts[0].text;
        } else if (anyResp.output_text) {
          result = anyResp.output_text;
        } else {
          console.error('🚨 Unexpected Gemini API response structure:', JSON.stringify(anyResp, null, 2));
          throw new Error('Gemini API সঠিক টেক্সট ফেরত দেয়নি');
        }

        console.log(`✅ Praggo AI Key #${this.currentKeyIndex + 1} successful`);
        return result;

      } catch (error: any) {
        lastError = error;
        console.log(`❌ Praggo AI Key #${this.currentKeyIndex + 1} failed:`, error.message);
        
        if (this.isQuotaError(error)) {
          console.log(`🔄 Quota exceeded, rotating to next key...`);
          if (!this.rotateToNextKey()) {
            break; // No more keys available
          }
          attempt++;
          continue;
        } else {
          // Non-quota error, don't retry with other keys
          break;
        }
      }
    }

    // All keys exhausted or non-quota error
    let errorMessage = '';
    if (lastError?.message?.includes('exhausted') || attempt >= this.maxRetries) {
      errorMessage = 'আজের জন্য আপনার Praggo AI ব্যবহারের সীমা শেষ! আগামীকাল আবার চেষ্টা করুন।';
    } else if (this.isQuotaError(lastError)) {
      errorMessage = 'Praggo AI এর সকল API key এর সীমা পূর্ণ! অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।';
    } else {
      errorMessage = lastError?.message || 'Praggo AI সেবায় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    }

    throw new Error(errorMessage);
  }

  // Get curriculum-specific instructions based on class level and subject
  private getCurriculumSpecificInstructions(classLevel: string, subject: string): string {
    // Class 6 curriculum instructions - STRICT SYLLABUS CONTROL
    if (classLevel === '6') {
      if (subject === 'science') {
        return `🔬 **ষষ্ঠ শ্রেণির বিজ্ঞান অনুসন্ধানী পাঠ - NCTB কারিকুলাম ২০২৫:**
⚠️ **STRICT SYLLABUS WARNING: শুধুমাত্র ৬ষ্ঠ শ্রেণির কারিকুলামের বিষয়বস্তু ব্যবহার করুন**

**অধ্যায়সমূহ (NCTB ৬ষ্ঠ শ্রেণি):**
১. বৈচিত্র্যময় জীবজগৎ - প্রাণী ও উদ্ভিদের বৈশিষ্ট্য
২. পরিবেশ ও জীববৈচিত্র্য - পরিবেশের উপাদান, বাস্তুতন্ত্র
৩. জীবের বৃদ্ধি ও বংশবৃদ্ধি - জীবচক্র, বংশবিস্তার
৪. কৃষি ও খাদ্য উৎপাদন - ফসল, মাটি, সার
৫. বায়ু ও পানি - গুণাগুণ, দূষণ, সংরক্ষণ
৬. আকাশ পরিচিতি - সূর্য, চাঁদ, গ্রহ-নক্ষত্র

**নিষিদ্ধ বিষয় (৬ষ্ঠ শ্রেণির বাইরে):**
❌ রাসায়নিক সমীকরণ, অণু-পরমাণুর জটিল গঠন
❌ কোষের অভ্যন্তরীণ অঙ্গাণু বিস্তারিত
❌ জটিল পদার্থবিজ্ঞানের সূত্র ও গণনা`;
      } else {
        return `📊 **ষষ্ঠ শ্রেণির গণিত - NCTB কারিকুলাম ২০২৫:**
⚠️ **STRICT SYLLABUS WARNING: শুধুমাত্র ৬ষ্ঠ শ্রেণির গণিত বিষয়বস্তু ব্যবহার করুন**

**অধ্যায়সমূহ (NCTB ৬ষ্ঠ শ্রেণি):**
১. প্রাকৃতিক সংখ্যা - সংখ্যারেখা, তুলনা, বিন্যাস
২. ভগ্নাংশ - প্রকার, যোগ-বিয়োগ, গুণ-ভাগ
৩. দশমিক ভগ্নাংশ - রূপান্তর, চার প্রক্রিয়া
৪. অনুপাত ও সমানুপাত - প্রাথমিক ধারণা
৫. শতকরা - প্রাথমিক হিসাব, দৈনন্দিন প্রয়োগ
৬. জ্যামিতি - মৌলিক আকার, পরিমাপের একক
৭. পরিসংখ্যান - তথ্য সংগ্রহ, সাজানো

**নিষিদ্ধ বিষয় (৬ষ্ঠ শ্রেণির বাইরে):**
❌ বীজগণিত, সূচক, বর্গমূল
❌ জ্যামিতিক প্রমাণ, উপপাদ্য
❌ ত্রিকোণমিতি, স্থানাঙ্ক জ্যামিতি`;
      }
    }
    // Class 7 curriculum instructions - STRICT SYLLABUS CONTROL
    else if (classLevel === '7') {
      if (subject === 'science') {
        return `🔬 **সপ্তম শ্রেণির বিজ্ঞান অনুসন্ধানী পাঠ - NCTB কারিকুলাম ২০২৫:**
⚠️ **STRICT SYLLABUS WARNING: শুধুমাত্র ৭ম শ্রেণির কারিকুলামের বিষয়বস্তু ব্যবহার করুন**

**অধ্যায়সমূহ (NCTB ৭ম শ্রেণি):**
১. আমাদের পরিবেশ - জীব ও জড় উপাদানের মিথস্ক্রিয়া
২. জীবের পরিচিতি ও শ্রেণিবিন্যাস - প্রাথমিক শ্রেণিবিভাগ
৩. কোষ ও কোষের গঠন - প্রাথমিক কোষ গঠন
৪. জীবে পুষ্টি - খাদ্য উপাদান, পুষ্টির প্রয়োজনীয়তা
৫. জীবে শ্বসন ও স্বাস্থ্য - শ্বসনতন্ত্র, রোগপ্রতিরোধ
৬. পদার্থ ও তার বৈশিষ্ট্য - কঠিন, তরল, বায়বীয়
৭. শক্তি ও পরিবর্তন - গতি, তাপ, আলো, শব্দ (প্রাথমিক)

**নিষিদ্ধ বিষয় (৭ম শ্রেণির বাইরে):**
❌ জটিল রাসায়নিক বিক্রিয়া ও সমীকরণ
❌ কোষের অভ্যন্তরীণ অঙ্গাণুর বিস্তারিত
❌ উন্নত পদার্থবিজ্ঞানের সূত্র ও গণনা`;
      } else {
        return `📊 **সপ্তম শ্রেণির গণিত - NCTB কারিকুলাম ২০২৫:**
⚠️ **STRICT SYLLABUS WARNING: শুধুমাত্র ৭ম শ্রেণির গণিত বিষয়বস্তু ব্যবহার করুন**

**অধ্যায়সমূহ (NCTB ৭ম শ্রেণি):**
১. মূলদ সংখ্যা - ধনাত্মক ও ঋণাত্মক সংখ্যা
২. ভগ্নাংশ - মিশ্র ভগ্নাংশ, উন্নত চার প্রক্রিয়া
৩. দশমিক ভগ্নাংশ - পৌনঃপুনিক দশমিক
৪. শতকরা - লাভ-ক্ষতি, সুদের প্রাথমিক হিসাব
৫. অনুপাত ও সমানুপাত - সরল ও যৌগিক অনুপাত
৬. বীজগণিত পরিচিতি - প্রাথমিক বীজগাণিতিক রাশি
৭. জ্যামিতি - কোণ, ত্রিভুজ, চতুর্ভুজের প্রাথমিক ধারণা
৮. তথ্য ব্যবস্থাপনা - গড়, মধ্যক (প্রাথমিক)

**নিষিদ্ধ বিষয় (৭ম শ্রেণির বাইরে):**
❌ সূচক ও লগারিদম
❌ জ্যামিতিক প্রমাণ ও উপপাদ্য
❌ ত্রিকোণমিতি, বর্গসমীকরণ`;
      }
    }
    // Class 8 curriculum instructions
    else if (classLevel === '8') {
      if (subject === 'science') {
        return `🔬 **বিজ্ঞান অনুসন্ধানী পাঠ (Class ${classLevel}) - NCTB নির্দেশনা:**
- পদার্থবিজ্ঞান: গতি, বল, সরল যন্ত্র, আলো, তাপ ও তাপমাত্রা
- রসায়ন: পদার্থের বৈশিষ্ট্য, মিশ্রণ, অণু-পরমাণু, রাসায়নিক পরিবর্তন
- জীববিজ্ঞান: জীবজগৎ, কোষ, উদ্ভিদ বৈশিষ্ট্য, সালোকসংশ্লেষণ, সংবেদি অঙ্গ
- পৃথিবী ও পরিবেশ: পৃথিবীর উৎপত্তি, পরিবেশের ভারসাম্য, খাদ্য ও পুষ্টি
- বাস্তব জীবনের উদাহরণ (বাংলাদেশী প্রেক্ষাপট: কৃষি, প্রকৃতি, স্বাস্থ্য)
- সহজ ভাষায় বৈজ্ঞানিক ব্যাখ্যা ও পরীক্ষা-নিরীক্ষা`;
      } else {
        return `📊 **গণিত (Class ${classLevel}) - NCTB নির্দেশনা:**
- সংখ্যা পদ্ধতি: প্রাকৃতিক সংখ্যা, ভগ্নাংশ, দশমিক
- প্রাথমিক বীজগণিত: সরল সমীকরণ, বীজগাণিতিক রাশি
- জ্যামিতি: মৌলিক আকার, পরিমাপ, ক্ষেত্রফল, আয়তন
- পরিসংখ্যান: তথ্য সংগ্রহ, উপস্থাপনা, গড় নির্ণয়
- ব্যবহারিক গণিত: অনুপাত, সমানুপাত, শতকরা, সুদ-আসল
- ধাপে ধাপে সমাধান পদ্ধতি ও বাস্তব জীবনের প্রয়োগ`;
      }
    }
    // Class 9-10 curriculum instructions  
    else if (classLevel === '9-10' || classLevel === '9' || classLevel === '10') {
      if (subject === 'science') {
        return `🔬 **বিজ্ঞান (৯ম-১০ম শ্রেণি) - SSC NCTB নির্দেশনা:**
- ফিজিক্স: বল ও গতি, কাজ শক্তি ক্ষমতা, তাপ, আলো, শব্দ, চুম্বকত্ব, স্থিতিশীল তড়িৎ
- কেমিস্ট্রি: পদার্থের অবস্থা, পরমাণু, পর্যায় সারণী, অম্ল-ক্ষার, রাসায়নিক বিক্রিয়া
- বায়োলজি: জীবকোষ, জীবপ্রক্রিয়া, বংশগতি, বিবর্তন, মানব দেহতত্ত্ব
- SSC বোর্ড পরীক্ষার স্টাইল অনুসরণ
- সূত্র প্রয়োগ, গণনা ও তত্ত্বীয় ব্যাখ্যার সমন্বয়`;
      } else if (subject === 'general_math') {
        return `📊 **সাধারণ গণিত (৯ম-১০ম শ্রেণি) - SSC NCTB নির্দেশনা:**
- বাস্তব সংখ্যা, সেট ও ফাংশন, বীজগাণিতিক রাশি
- সূচক ও লগারিদম, সমীকরণ সমাধান
- জ্যামিতি: রেখা, কোণ, ত্রিভুজ, বৃত্ত, ক্ষেত্রফল
- ত্রিকোণমিতি, দূরত্ব ও উচ্চতা, পরিমিতি
- পরিসংখ্যান ও বাস্তব জীবনের সমস্যা সমাধান`;
      } else if (subject === 'higher_math') {
        return `🔺 **উচ্চতর গণিত (৯ম-১০ম শ্রেণি) - SSC NCTB নির্দেশনা:**
- সেট ও ফাংশন, বীজগাণিতিক রাশি, জ্যামিতিক অঙ্কন
- সমীকরণ ও অসমতা, অসীম ধারা, ত্রিকোণমিতি
- সূচকীয় ও লগারিদমীয় ফাংশন, দ্বিপদী বিস্তৃতি
- স্থানাঙ্ক জ্যামিতি, সমতলীয় ভেক্টর, ত্রিমাত্রিক জ্যামিতি
- উচ্চতর গাণিতিক চিন্তাভাবনা ও সূত্রের প্রমাণ`;
      }
    }
    // Class 11-12 curriculum instructions (HSC)
    else if (classLevel === '11-12' || classLevel === '11' || classLevel === '12') {
      if (subject === 'physics') {
        return `⚡ **পদার্থবিজ্ঞান (একাদশ-দ্বাদশ শ্রেণি) - HSC NCTB নির্দেশনা:**
- যন্ত্রবিদ্যা: গতিবিদ্যা, স্থিতিবিদ্যা, কম্পন ও তরঙ্গ
- তাপ ও ঠার্মোডায়নামিক্স: তাপীয় ধর্ম, গ্যাসের আচরণ
- আলোকবিদ্যা: জ্যামিতিক আলোকবিদ্যা, তরঙ্গ আলোকবিদ্যা
- তড়িৎ ও চুম্বকত্ব: তড়িৎ ক্ষেত্র, চৌম্বক ক্ষেত্র, প্রবাহ
- আধুনিক পদার্থবিদ্যা: পারমাণবিক পদার্থবিদ্যা, তেজস্ক্রিয়তা`;
      } else if (subject === 'chemistry') {
        return `🧪 **রসায়ন (একাদশ-দ্বাদশ শ্রেণি) - HSC NCTB নির্দেশনা:**
- পদার্থের গঠন: পরমাণু, অণু, রাসায়নিক বন্ধন
- পদার্থের অবস্থা: গ্যাস, তরল, কঠিন পদার্থের ধর্ম
- রাসায়নিক বিক্রিয়া: অজৈব রসায়ন, জৈব রসায়ন
- সমাধান রসায়ন: দ্রবণ, তড়িৎ বিশ্লেষণ
- পরিবেশ রসায়ন: দূষণ, সবুজ রসায়ন`;
      } else if (subject === 'biology') {
        return `🧬 **জীববিজ্ঞান (একাদশ-দ্বাদশ শ্রেণি) - HSC NCTB নির্দেশনা:**
- কোষবিদ্যা: কোষের গঠন ও কার্যাবলী, কোষ বিভাজন
- টিস্যু ও অঙ্গতন্ত্র: উদ্ভিদ ও প্রাণীর টিস্যু
- শ্বসন ও সালোকসংশ্লেষণ: শক্তি রূপান্তর প্রক্রিয়া
- বংশগতি ও বিবর্তন: DNA, RNA, বংশগতির সূত্র
- জীব প্রযুক্তি: জেনেটিক ইঞ্জিনিয়ারিং, বায়োটেকনোলজি`;
      } else if (subject === 'higher_math') {
        return `📐 **উচ্চতর গণিত (একাদশ-দ্বাদশ শ্রেণি) - HSC NCTB নির্দেশনা:**
- ম্যাট্রিক্স ও নির্ণায়ক: ম্যাট্রিক্স বীজগণিত, সমীকরণ সমাধান
- ভেক্টর: দ্বিমাত্রিক ও ত্রিমাত্রিক ভেক্টর, ভেক্টর বীজগণিত
- জটিল সংখ্যা: জটিল সমতল, ধ্রুবক ও চল
- ক্যালকুলাস: অন্তরীকরণ, সমাকলন, প্রয়োগ
- সম্ভাব্যতা ও পরিসংখ্যান: বিতরণ, পরীক্ষণ`;
      }
    }
    
    // Default fallback
    return `📚 **${subject} বিষয়ক নির্দেশনা:**
- NCTB কারিকুলাম অনুসরণ করুন
- বাংলাদেশের প্রেক্ষাপটে উদাহরণ দিন
- ধাপে ধাপে সমাধান প্রদান করুন`;
  }

  // Generate questions with enhanced Bangladeshi context and 5-key rotation
  async generateQuestions(
    subject: string,
    classLevel: string,
    chapter: string,
    questionType: string,
    questionCategory: string,
    difficulty: string,
    count: number,
    userId: string,
    userRole: 'teacher' | 'student'
  ): Promise<any> {
    
    // Check if at least one key is configured
    if (!this.getCurrentKey()) {
      throw new Error('PraggoAI API Keys কনফিগার করা হয়নি। API_KEYS array-তে valid keys যোগ করুন।');
    }

    // Get Bangla subject name with proper classification
    let subjectBangla = '';
    if (classLevel === '6' || classLevel === '7' || classLevel === '8') {
      subjectBangla = subject === 'science' ? 'বিজ্ঞান অনুসন্ধানী পাঠ' : 'গণিত';
    } else if (classLevel === '9-10') {
      if (subject === 'general_math') {
        subjectBangla = 'সাধারণ গণিত';
      } else if (subject === 'higher_math') {
        subjectBangla = 'উচ্চতর গণিত';
      } else {
        subjectBangla = 'বিজ্ঞান';
      }
    }
    
    // Get class level in Bangla
    let classLevelBangla = '';
    switch (classLevel) {
      case '6': classLevelBangla = 'ষষ্ঠ শ্রেণি'; break;
      case '7': classLevelBangla = 'সপ্তম শ্রেণি'; break;
      case '8': classLevelBangla = 'অষ্টম শ্রেণি'; break;
      case '9-10': classLevelBangla = 'নবম-দশম শ্রেণি'; break;
      default: classLevelBangla = classLevel;
    }
    
    let difficultyLevels = '';
    if (difficulty === 'mixed') {
      difficultyLevels = 'সহজ, মধ্যম ও জটিল স্তরের মিশ্রণ';
    } else if (difficulty === 'easy') {
      difficultyLevels = 'সহজ স্তরের';
    } else if (difficulty === 'medium') {
      difficultyLevels = 'মধ্যম স্তরের';
    } else {
      difficultyLevels = 'জটিল স্তরের';
    }

    // Get question category description
    let questionCategoryDescription = '';
    if (questionCategory === 'math-based') {
      questionCategoryDescription = 'গণিত ভিত্তিক প্রশ্ন - গণনা, সূত্র প্রয়োগ, সংখ্যাগত সমস্যা';
    } else if (questionCategory === 'theory-based') {
      questionCategoryDescription = 'তত্ত্ব ভিত্তিক প্রশ্ন - ধারণা, সংজ্ঞা, ব্যাখ্যা, তুলনা';
    } else {
      questionCategoryDescription = 'মিশ্র প্রশ্ন - গণিত ও তত্ত্ব উভয় ধরনের';
    }

    // Enhanced Bangladeshi context prompt with NCTB curriculum
    const curriculumInstructions = this.getCurriculumSpecificInstructions(classLevel, subject);
    
  const prompt = `আপনি "Praggo AI" - বাংলাদেশের NCTB ভিত্তিক স্মার্ট শিক্ষা সহায়ক।

🏆 Science & Math Care প্ল্যাটফর্মের জন্য ${count}টি ${difficultyLevels} ${subjectBangla} প্রশ্ন তৈরি করুন।

🎯 **BANGLADESH NCTB CURRICULUM FOCUS**
আপনি একজন ১৫+ বছরের অভিজ্ঞ ${subjectBangla} বিশেষজ্ঞ শিক্ষক যিনি NCTB কারিকুলাম এবং বাংলাদেশের শিক্ষাব্যবস্থায় দক্ষ।

📚 প্রশ্নের বিবরণ:
- বিষয়: ${subjectBangla} (${subject})
- শ্রেণি: ${classLevelBangla}
- অধ্যায়/টপিক: ${chapter}
- প্রশ্নের ধরন: ${questionType}
- প্রশ্নের বিষয়বস্তু: ${questionCategoryDescription}
- কঠিনতার স্তর: ${difficultyLevels}

🇧🇩 NCTB কারিকুলাম ও বাংলাদেশের বাস্তব শিক্ষাব্যবস্থা অনুযায়ী:

${curriculumInstructions}

${(classLevel === '6' || classLevel === '7') ? `
🚨 **CRITICAL SYLLABUS COMPLIANCE FOR CLASS ${classLevel}:**
- প্রশ্ন তৈরির আগে অবশ্যই নিশ্চিত করুন যে সমস্ত বিষয়বস্তু ${classLevel === '6' ? 'ষষ্ঠ' : 'সপ্তম'} শ্রেণির NCTB কারিকুলামের অন্তর্ভুক্ত
- উপরে উল্লেখিত নিষিদ্ধ বিষয়গুলো কোনোভাবেই প্রশ্নে আনবেন না
- প্রতিটি প্রশ্ন শিক্ষার্থীর বয়স ও জ্ঞানের স্তর অনুযায়ী হতে হবে
- জটিল ধারণা এড়িয়ে সহজ ও বোধগম্য ভাষায় প্রশ্ন তৈরি করুন
- শুধুমাত্র ${classLevel === '6' ? 'ষষ্ঠ' : 'সপ্তম'} শ্রেণির পাঠ্যবইয়ে থাকা বিষয়বস্তু ব্যবহার করুন` : ''}

🎯 **উত্তরে অবশ্যই যা থাকতে হবে:**
- সঠিক উত্তরের সম্পূর্ণ ব্যাখ্যা ও যুক্তি
- ধাপে ধাপে সমাধান প্রক্রিয়া (গণিত/বিজ্ঞানের জন্য)
- বাস্তব জীবনের সাথে সম্পর্ক বা প্রয়োগ
- সাধারণ ভুল ও সেগুলো এড়ানোর উপায়
- অতিরিক্ত টিপস ও মনে রাখার কৌশল

${questionCategory === 'math-based' ? `🧮 **গণিত ভিত্তিক প্রশ্ন তৈরির বিশেষ নির্দেশনা:**
- সূত্র প্রয়োগ ভিত্তিক প্রশ্ন তৈরি করুন
- সংখ্যাগত গণনা ও হিসাব-নিকাশ অন্তর্ভুক্ত করুন
- মান নির্ণয়, পরিমাণ গণনা, শতকরা হিসাব
- গ্রাফ, চার্ট, টেবিল থেকে তথ্য বিশ্লেষণ
- বাস্তব জীবনের ডেটা দিয়ে গাণিতিক সমস্যা
- ধাপে ধাপে সমাধানযোগ্য গণনামূলক প্রশ্ন` : questionCategory === 'theory-based' ? `📖 **তত্ত্ব ভিত্তিক প্রশ্ন তৈরির বিশেষ নির্দেশনা:**
- ধারণা, সংজ্ঞা, ব্যাখ্যা ভিত্তিক প্রশ্ন
- তুলনামূলক বিশ্লেষণ ও পার্থক্য
- কারণ-ফলাফল সম্পর্ক ব্যাখ্যা
- প্রক্রিয়া বর্ণনা ও ক্রমধারা
- বৈশিষ্ট্য, গুণাবলী ও প্রয়োগ বর্ণনা
- তাত্ত্বিক জ্ঞান ও বোঝাপড়া পরীক্ষা` : `🔄 **মিশ্র প্রশ্ন তৈরির নির্দেশনা:**
- গণিত ও তত্ত্ব উভয় ধরনের প্রশ্ন তৈরি করুন
- কিছু প্রশ্নে গণনা ও কিছুতে ধারণা থাকবে
- তাত্ত্বিক জ্ঞানের সাথে ব্যবহারিক প্রয়োগ
- সূত্র ব্যাখ্যা এবং তার প্রয়োগ উভয়ই`}

${subject === 'science' ? `🔬 বিজ্ঞান (ফিজিক্স + কেমিস্ট্রি + বায়োলজি ভিত্তিক) নির্দেশনা:
- পদার্থ, শক্তি, জীববিজ্ঞান ও পরিবেশের সমন্বয়
- বাস্তব জীবনের উদাহরণ (বাংলাদেশ কেন্দ্রিক: কৃষি, জলবায়ু, স্বাস্থ্য)
- প্রয়োজনীয় ক্ষেত্রে সূত্র, রাসায়নিক সমীকরণ, চিত্র বর্ণনা টেক্সটে
- এসএসসি / এইচএসসি বোর্ড প্রশ্নের স্টাইল অনুসরণ
- বিভ্রান্তিকর অপশন (MCQ) তৈরি করুন` : `➗ গণিতের জন্য নির্দেশনা:
- মৌলিক থেকে উচ্চতর ধারণা (অ্যালজেব্রা, জ্যামিতি, ত্রিকোণমিতি, ক্যালকুলাস - শ্রেণি অনুযায়ী)
- ধাপে ধাপে সমাধান (Step-by-step solution)
- সূত্রের ব্যবহার ও রূপান্তর
- বাস্তব জীবনের প্রয়োগ (আর্থিক গণিত, জ্যামিতিক পরিমাপ, তথ্য বিশ্লেষণ)
- কঠিন প্রশ্নে ইঙ্গিত (hint) সংযুক্ত করুন`}

📋 JSON ফরম্যাট (বাংলায় উত্তর ও ব্যাখ্যা):
${questionType === 'mcq' ? 'MCQ ফরম্যাট:' : questionType === 'cq' ? 'CQ ফরম্যাট:' : 'সৃজনশীল প্রশ্ন ফরম্যাট:'}

⚠️ **প্রতিটি প্রশ্নের উত্তরে অবশ্যই বিস্তারিত ব্যাখ্যা থাকতে হবে:**
- সঠিক উত্তর কেন সঠিক তার কারণ
- ভুল অপশনগুলো কেন ভুল (MCQ এর ক্ষেত্রে)
- সূত্র প্রয়োগের ধাপসমূহ (গণিত/বিজ্ঞানের ক্ষেত্রে)
- বাস্তব জীবনের সাথে সম্পর্ক
- অতিরিক্ত টিপস ও সতর্কতা

🎯 **CRITICAL EXPLANATION REQUIREMENTS:**
${questionCategory === 'math-based' || subject === 'math' || subject === 'general_math' || subject === 'higher_math' ? `
📊 **গণিত প্রশ্নের জন্য MANDATORY SOLVE SECTION:**
- "সমাধান:" দিয়ে শুরু করুন
- ধাপ ১, ধাপ ২, ধাপ ৩... এভাবে সমাধান লিখুন
- প্রতিটি ধাপে কোন সূত্র/নিয়ম ব্যবহার করা হলো তা স্পষ্ট করুন
- গণনার প্রতিটি পদক্ষেপ দেখান
- শেষে "∴ উত্তর: [ফলাফল]" লিখুন` : `
🔬 **বিজ্ঞান প্রশ্নের জন্য MANDATORY EXPLANATION:**
- "ব্যাখ্যা:" দিয়ে শুরু করুন
- বৈজ্ঞানিক ধারণা ও নীতি ব্যাখ্যা করুন
- প্রয়োজনে সূত্র, বিক্রিয়া বা প্রক্রিয়া বর্ণনা করুন
- কেন অন্য অপশনগুলো ভুল তা ব্যাখ্যা করুন`}

[{"questionText": "বাংলায় প্রশ্ন", "questionType": "${questionType}", ${questionType === 'mcq' ? '"options": ["ক) ...", "খ) ...", "গ) ...", "ঘ) ..."], "correctAnswer": "ক) ...",' : '"options": null, "correctAnswer": null,'} "answer": "সঠিক উত্তর: [উত্তর]\\n\\n${questionCategory === 'math-based' || subject === 'math' || subject === 'general_math' || subject === 'higher_math' ? 'সমাধান:\\nধাপ ১: [প্রথম ধাপ]\\nধাপ ২: [দ্বিতীয় ধাপ]\\n...\\n∴ উত্তর: [ফলাফল]' : 'ব্যাখ্যা: [বিস্তারিত বৈজ্ঞানিক ব্যাখ্যা]'}\\n\\nভুল অপশনগুলোর ব্যাখ্যা: [কেন অন্যগুলো ভুল]\\nবাস্তব জীবনের সাথে সম্পর্ক: [প্রায়োগিক উদাহরণ]\\nঅতিরিক্ত টিপস: [মনে রাখার কৌশল ও সতর্কতা]", "marks": ${questionType === 'creative' ? '10' : questionType === 'cq' ? '2' : '1'}}]`;

    try {
        const content = await this.makeAPICall(
        prompt, userId, userRole, 'generate_questions', subject as 'science' | 'math'
      );
      
      console.log("Praggo AI response for Bangladesh questions:", content);
      
      // Parse JSON response
      let jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          jsonMatch = [jsonMatch[1]];
        }
      }
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError);
          throw new Error('Praggo AI থেকে সঠিক ফরম্যাটে উত্তর পাওয়া যায়নি।');
        }
      } else {
        throw new Error('Praggo AI থেকে JSON ফরম্যাটে উত্তর পাওয়া যায়নি।');
      }
      
    } catch (error: any) {
      console.error('Praggo AI question generation error:', error);
      throw error;
    }
  }

  // Solve student doubts with NCTB context and 5-key rotation
  async solveDoubt(
    question: string,
    subject: string,
    userId: string,
    userRole: 'student'
  ): Promise<string> {
    
    if (!this.getCurrentKey()) {
      return `🤖 Praggo AI সমাধান (কী নেই)\n\nআপনার ${subject === 'science' ? 'বিজ্ঞান' : 'গণিত'} প্রশ্ন: "${question}"\n\nAPI keys কনফিগার করা হয়নি।`;
    }

    const subjectBangla = subject === 'science' ? 'বিজ্ঞান' : 'গণিত';

    const prompt = `আপনি "Praggo AI" - বাংলাদেশের শিক্ষার জন্য বিশেষভাবে তৈরি একটি AI শিক্ষা সহায়ক।

🎓 Science & Math Care প্ল্যাটফর্মের একজন বিশেষজ্ঞ ${subjectBangla} শিক্ষক হিসেবে উত্তর দিন।

📝 শিক্ষার্থীর প্রশ্ন: ${question}

🇧🇩 **বাংলাদেশের সর্বোচ্চ মানের শিক্ষা ব্যবস্থা অনুযায়ী** একটি বিশেষজ্ঞ মানের সমাধান প্রদান করুন:

📖 NCTB কারিকুলাম ২০২৫ অনুযায়ী সর্বশেষ আপডেট
🏆 ঢাবি/বুয়েট/মেডিকেল ভর্তি পরীক্ষার মান বজায় রেখে
🎯 বাংলাদেশের সাংস্কৃতিক ও ভৌগোলিক প্রেক্ষাপটে সমাধান

${subject === 'science' ? `🔬 বিজ্ঞান সমাধানের জন্য:
- ধারণা ব্যাখ্যা → সূত্র/নিয়ম → প্রয়োগ
- প্রয়োজনে রাসায়নিক বিক্রিয়া, জৈব প্রক্রিয়া, পদার্থবিজ্ঞানের সূত্র
- বাংলাদেশের প্রেক্ষাপটে উদাহরণ দিন
- অতিরিক্ত অনুশীলনের জন্য ১-২টি ছোট প্রশ্ন প্রস্তাব করুন` : `➗ গণিত সমাধানের জন্য:
- ধাপে ধাপে (Step-by-step) ব্যাখ্যা
- কোথায় কোন সূত্র ব্যবহৃত হলো তা উল্লেখ
- বিকল্প পদ্ধতি থাকলে সংক্ষেপে বলুন
- সাধারণ ভুল (Common mistakes) উল্লেখ করুন
- শেষে সংক্ষিপ্ত পুনরালোচনা দিন`}

✨ উত্তরটি অবশ্যই:
- সহজ ও বোধগম্য বাংলায় লিখুন
- ধাপে ধাপে বিস্তারিত ব্যাখ্যা করুন (Why & How)
- বাংলাদেশী শিক্ষার্থীদের জন্য প্রাসঙ্গিক উদাহরণ দিন
- উৎসাহমূলক ও শিক্ষণীয় টোন ব্যবহার করুন
- সূত্র বা নিয়ম প্রয়োগের প্রক্রিয়া স্পষ্ট করুন
- সাধারণ ভুলত্রুটি ও এড়ানোর উপায় উল্লেখ করুন

🎯 Praggo AI সমাধান:`;

    try {
      const result = await this.makeAPICall(
        prompt, userId, userRole, 'solve_doubt', subject as 'science' | 'math'
      );
      
      return result;
    } catch (error: any) {
      console.error('Praggo AI doubt solving error:', error);
      return `🤖 Praggo AI সমাধান (ত্রুটি)\n\nআপনার ${subjectBangla} প্রশ্ন: "${question}"\n\n❌ ${error.message}\n\nঅনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন বা শিক্ষকের সাহায্য নিন।`;
    }
  }

  // Get API usage statistics
  async getUsageStats(userId: string): Promise<any> {
    // Usage stats disabled without database
    return {
      todayUsage: 0,
      successfulCalls: 0,
      failedCalls: 0,
      questionsGenerated: 0,
      doubtsResolved: 0,
      trackingDisabled: true
    };
  }
}

// Export singleton instance
export const praggoAI = PraggoAIService.getInstance();