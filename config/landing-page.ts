// config/landing-page.ts

export const heroContent = {
    announcement: {
      emoji: '🚀',
      text: 'Transform Articles into Visual Flowcharts with AI',
    },
    heading: 'UltraFlow: AI-Powered Article to Flowchart Converter',
    subheading:
      "Convert any article or text into beautiful, structured flowcharts using Google Gemini AI. Smart A4 optimization, local caching, and instant exports - all open source.",
    cta: {
      primary: {
        text: 'Start Creating',
        href: '/flowchart',
      },
      secondary: {
        text: 'GitHub',
        href: '', // Will use siteConfig.links.github
      },
    },
    socialProof: {
      totalUsers: 200,
      displayText: 'Join 200+ content creators',
      avatarUrls: [
        'https://avatars.githubusercontent.com/u/16860528',
        'https://avatars.githubusercontent.com/u/20110627',
        'https://avatars.githubusercontent.com/u/106103625',
        'https://avatars.githubusercontent.com/u/59228569',
      ],
    },
    quotes: [
      {
        text: "This tool saved me hours of manual diagramming. The AI understands context perfectly!",
        author: 'ContentCreator',
        title: 'Technical Writer',
        avatarFallback: 'CC',
        avatarImg: '/images/user1.png',
      },
      {
        text: "The A4 optimization feature is brilliant - my flowcharts are always print-ready.",
        author: 'DesignPro',
        title: 'UX Designer',
        avatarFallback: 'DP',
        avatarImg: '/images/user2.jpg',
      },
      {
        text: 'Love the local caching! I can quickly access and reuse my previous articles.',
        author: 'DataAnalyst',
        title: 'Business Analyst',
        avatarFallback: 'DA',
        avatarImg: '/images/user3.jpg',
      },
    ],
    particles: {
      quantity: 300,
      ease: 80,
    },
  };
  
  export const logoCloudContent = {
    heading: 'Built with cutting-edge technology',
    logos: [
      {
        name: 'Next.js',
        href: 'https://nextjs.org',
        ariaLabel: 'Next.js 15 Framework',
      },
      {
        name: 'React',
        href: 'https://react.dev',
        ariaLabel: 'React 19 Library',
      },
      {
        name: 'Google AI',
        href: 'https://ai.google.dev',
        ariaLabel: 'Google Gemini AI',
      },
      {
        name: 'Mermaid',
        href: 'https://mermaid.js.org',
        ariaLabel: 'Mermaid Diagramming',
      },
      {
        name: 'TypeScript',
        href: 'https://www.typescriptlang.org',
        ariaLabel: 'TypeScript Language',
      },
    ],
  };
  
  export const featuresContent = {
    default: {
      heading: 'Features',
      description:
        'UltraFlow uses advanced AI to analyze your articles and automatically generate structured flowcharts. With intelligent optimization, local storage, and powerful editing tools, creating visual diagrams has never been easier.',
      footer:
        'Built with Next.js 15, React 19, and powered by Google Gemini AI for accurate text analysis and visualization.',
    },
    hover: {
      heading: 'Core Features',
      description:
        'Transform text into flowcharts instantly, optimize for A4 printing, cache articles locally for quick access, generate AI banner images, and export in multiple formats. All features work seamlessly together.',
      footer:
        'UltraFlow includes comprehensive guides for A4 optimization, article caching, Gemini setup, and deployment.',
    },
  };
  
  export const bentoGridContent = {
    files: [
      {
        name: 'article-analysis.ai',
        body: 'AI-powered article analysis using Google Gemini to understand context, extract key points, and identify logical flow structures automatically.',
      },
      {
        name: 'flowchart-output.svg',
        body: 'Generate beautiful Mermaid flowcharts with customizable themes and styling. Export as SVG or PNG for presentations and documentation.',
      },
      {
        name: 'a4-optimization.pdf',
        body: 'Intelligent A4 page size optimization automatically restructures large flowcharts into subgraphs with alternating layouts for perfect printing.',
      },
      {
        name: 'article-cache.db',
        body: 'Client-side IndexedDB caching stores your articles locally. Search, filter, and reload previous articles without server dependency.',
      },
      {
        name: 'banner-image.png',
        body: 'Generate AI-powered banner images using Gemini 2.5 Flash Image model. Perfect for social media, presentations, and article headers.',
      },
    ],
    features: [
      {
        name: 'Instant Flowcharts',
        description: 'Paste your article and get a structured flowchart in seconds powered by Google Gemini AI.',
        href: '/flowchart',
        cta: 'Try it now',
      },
      {
        name: 'Smart Optimization',
        description: 'A4 page optimization automatically restructures diagrams for perfect printing and presentation.',
        href: '/flowchart',
        cta: 'Learn more',
      },
      {
        name: 'Local Cache',
        description: 'Search and reuse your previous articles with client-side IndexedDB storage. Privacy-first design.',
        href: '/flowchart',
        cta: 'Explore',
      },
      {
        name: 'Live Editor',
        description: 'Interactive Mermaid editor with live preview. Edit diagrams manually and see changes instantly.',
        href: '/mermaid-editor',
        cta: 'Edit now',
      },
      {
        name: 'Banner Generator',
        description: 'Create stunning AI-generated banner images for your flowcharts using Gemini image model.',
        href: '/flowchart',
        cta: 'Generate',
      },
      {
        name: 'Export Options',
        description: 'Download your flowcharts as SVG or PNG with A4 optimization. Ready for print or web.',
        href: '/flowchart',
        cta: 'Export',
      },
    ],
  };
  
  export const testimonialsContent = {
    heading: 'What Users Are Saying',
    subheading: 'Trusted by content creators, educators, and professionals',
  };
  
  export const faqContent = {
    heading: 'Frequently Asked Questions',
    subheading: 'Everything you need to know about UltraFlow',
    questions: [
      {
        question: 'How does UltraFlow convert articles to flowcharts?',
        answer: 'UltraFlow uses Google Gemini AI to analyze your article, identify key concepts and their relationships, and automatically generate a structured Mermaid flowchart that visualizes the information flow.',
      },
      {
        question: 'What is A4 optimization?',
        answer: 'A4 optimization automatically restructures large flowcharts to fit standard A4 paper dimensions (794×1123px). It intelligently splits nodes into subgraphs with alternating vertical and horizontal layouts for optimal space usage.',
      },
      {
        question: 'Is my data stored on servers?',
        answer: 'No! UltraFlow uses client-side IndexedDB for article caching. All your articles are stored locally in your browser. Your data never leaves your device unless you explicitly export it.',
      },
      {
        question: 'Can I edit the generated flowcharts?',
        answer: 'Yes! Use the Mermaid Editor to manually edit any flowchart. Changes are reflected instantly in the live preview. You can also apply custom themes and styling.',
      },
      {
        question: 'What export formats are supported?',
        answer: 'You can export flowcharts as SVG (vector) or PNG (raster) images. Both formats respect A4 optimization settings for print-ready output.',
      },
      {
        question: 'Do I need a Google Gemini API key?',
        answer: 'Yes, you need a free Google Gemini API key to use the AI-powered features. Get one at https://makersuite.google.com/app/apikey',
      },
    ],
  };
  
  export const contactContent = {
    heading: 'Have Questions or Feedback?',
    subheading: 'We\'d love to hear from you',
    cta: {
      text: 'Get in Touch',
    },
    offices: {
      heading: 'Connect With Us',
      locations: [
        {
          city: 'GitHub',
          address: ['Open Source Repository', 'Contributions Welcome'],
        },
        {
          city: 'Documentation',
          address: ['Complete Setup Guides', 'API Reference & Examples'],
        },
      ],
    },
  };
  
  export const workflowContent = {
    heading: 'How It Works',
    subheading: 'Simple 3-step process to create beautiful flowcharts',
    steps: [
      {
        number: 1,
        title: 'Paste Your Article',
        description: 'Copy and paste any article, documentation, or text content. UltraFlow automatically saves it to your local cache.',
        icon: '📝',
      },
      {
        number: 2,
        title: 'AI Analysis',
        description: 'Google Gemini AI analyzes your text, identifies key concepts, and generates a structured Mermaid flowchart diagram.',
        icon: '🤖',
      },
      {
        number: 3,
        title: 'Export & Share',
        description: 'Review, edit if needed, and export as SVG or PNG. A4 optimization ensures perfect printing every time.',
        icon: '📊',
      },
    ],
  };
  
  