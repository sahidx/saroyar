// Permanent Developer Profile Data
// This file contains the developer profile information that will persist across deployments

export const DEVELOPER_PROFILE = {
  personal: {
    name: 'Md Sahid Rahman',
    title: 'Founder & CEO of Praggo',
    subtitle: 'Civil Engineering Student',
    profileImage: '/attached_assets/Untitled_1757081806274.jpg',
    university: 'Gopalganj Science and Technology University',
    degree: 'B.Sc Civil Engineering (ongoing)',
    email: 'sahidrahmanx@gmail.com',
    facebook: 'https://www.facebook.com/share/16qPLuCvu8/',
    founded: '2025',
    established: '2025-Present'
  },

  bio: {
    bengali: {
      intro: 'আমি মোঃ সাহিদ রহমান, প্রাগো গ্রুপের প্রতিষ্ঠাতা ও প্রধান নির্বাহী কর্মকর্তা। আমি একজন সাইবার সিকিউরিটি এক্সপার্ট এবং বাগ বাউন্টি হান্টার। আমি গোপালগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় থেকে সিভিল ইঞ্জিনিয়ারিং অধ্যয়নরত আছি।',
      mission: 'আমি ACS-এ একজন সন্দেহ নিরসনকারী হিসেবে কাজ করি এবং ছাত্র-ছাত্রীদের শিক্ষায় সহায়তা করি। প্রযুক্তি ও সাইবার নিরাপত্তার মাধ্যমে আমি শিক্ষা ক্ষেত্রে অবদান রাখতে চাই।',
      quote: 'উদ্ভাবন ও প্রযুক্তির মাধ্যমে আমরা একটি উন্নত ভবিষ্যৎ গড়তে পারি।'
    }
  },

  skills: [
    { name: 'Cyber Security Expert', level: 'Expert', years: 6, color: 'bg-red-500' },
    { name: 'Bug Bounty Hunter', level: 'Professional', years: 5, color: 'bg-orange-500' },
    { name: 'Web Development', level: 'Expert', years: 6, color: 'bg-purple-500' },
    { name: 'React & TypeScript', level: 'Advanced', years: 4, color: 'bg-cyan-500' },
    { name: 'Full Stack Development', level: 'Expert', years: 5, color: 'bg-blue-600' },
    { name: 'Educational Technology', level: 'Advanced', years: 3, color: 'bg-green-500' }
  ],

  achievements: [
    { title: 'Founder & CEO of Praggo', year: '2025-Present', type: 'leadership' },
    { title: 'Civil Engineering Student', year: '2023-Present', type: 'education' },
    { title: 'Cyber Security Expert', year: '2023-Present', type: 'professional' },
    { title: 'Bug Bounty Hunter', year: '2023-Present', type: 'professional' },
    { title: 'Doubt Solver at ACS', year: '2024-Present', type: 'education' }
  ],

  company: {
    name: 'Praggo Group',
    founded: '2025',
    vision: 'Leading technology and innovation for a better future',
    mission: 'Providing comprehensive solutions across multiple industries',
    
    services: [
      {
        name: 'Praggo Civil Engineering Firm & Interior',
        nameBengali: 'স্থপতি উদ্ভাবনার ক্ষেত্র বাড়ির ডিজাইনে এবং ইন্টেরিয়ারে ডিজাইনে করে দেওয়া হয়',
        category: 'construction',
        established: '2020'
      },
      {
        name: 'Praggo IT',
        nameBengali: 'এখানে বিভিন্ন ব্যবসা প্রতিষ্ঠান, শিক্ষা প্রতিষ্ঠান, কোম্পানির কর্পোরেটিভ Website, Software & Apps তৈরি করা হয় এবং সকল প্রকার IT সেবা প্রদান করা হয়',
        category: 'technology',
        established: '2020'
      },
      {
        name: 'Praggo Academy',
        nameBengali: 'এখানে বুয়েট সহ পাবলিক বিশ্ববিদ্যালয়ের শিক্ষার্থীদের ভর্তি একাডেমিক, চাকুরি এবং প্রস্তুতি বিষয়ক শিক্ষা প্রদান করা হয়',
        category: 'education',
        established: '2021'
      },
      {
        name: 'Praggo Study Abroad',
        nameBengali: 'এখানে শিক্ষার্থীদের বিদেশে ভর্তি সংক্রান্ত বিষয়ে সহায়তা করা হয়',
        category: 'education',
        established: '2022'
      },
      {
        name: 'Praggo Ad Agency',
        nameBengali: 'এখানে বিভিন্ন ব্যবসা প্রতিষ্ঠানের অনলাইন মার্কেটিং, ফেসবুক বুস্টিং এবং ব্র্যান্ডিক গ্রাফিক্স কন্টেট তৈরি করে দেওয়া হয়',
        category: 'marketing',
        established: '2021'
      },
      {
        name: 'Praggo Agro',
        nameBengali: 'কৃষি ক্ষেত্রে আধুনিক প্রযুক্তি ও সেবা প্রদান',
        category: 'agriculture',
        established: '2022'
      },
      {
        name: 'Praggo Properties',
        nameBengali: 'রিয়েল এস্টেট ও সম্পত্তি সংক্রান্ত সেবা',
        category: 'real-estate',
        established: '2023'
      }
    ]
  },

  metadata: {
    lastUpdated: '2025-01-05',
    version: '1.0.0',
    deploymentReady: true
  }
};

export default DEVELOPER_PROFILE;