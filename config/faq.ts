// config/faq.ts

export const faqItems = [
  {
    question: 'How does Ultra Flow generate flowcharts from articles?',
    answer:
      'Ultra Flow uses Google Gemini AI to analyze your article content, understand the logical flow, and automatically generate structured Mermaid flowcharts. Simply paste your article text, and our AI identifies key concepts, relationships, and creates a visual diagram in seconds.'
  },
  {
    question: 'What export formats are supported?',
    answer:
      'You can export your flowcharts as SVG or PNG images. We also provide A4 page optimization that automatically restructures large diagrams into subgraphs with alternating layouts, perfect for printing and presentations.'
  },
  {
    question: 'Is my article data stored or shared?',
    answer:
      'Your privacy is our priority. Articles are processed client-side and cached locally in your browser using IndexedDB. We do not store your articles on our servers. The AI processing happens through secure API calls, and data is not retained after generation.'
  },
  {
    question: 'Can I edit the generated flowcharts?',
    answer:
      'Absolutely! Ultra Flow includes a live Mermaid editor where you can manually edit the generated diagrams. Any changes you make are instantly previewed, giving you full control over the final output.'
  },
  {
    question: 'What kind of articles work best?',
    answer:
      'Ultra Flow works best with articles that have clear logical structure, processes, or workflows. Technical documentation, how-to guides, process descriptions, and educational content typically produce excellent results. The AI can handle various writing styles and automatically identifies the flow.'
  },
  {
    question: 'Are there any usage limits?',
    answer:
      'With our paid plans, you get unlimited flowchart generation. The local cache feature allows you to search and reuse previous articles without any restrictions. Banner image generation uses AI credits which vary by plan.'
  },
  {
    question: 'Can I use the generated flowcharts commercially?',
    answer:
      'Yes! All flowcharts you generate with Ultra Flow are yours to use for any purpose, including commercial projects, presentations, documentation, and publications. There are no attribution requirements.'
  },
  {
    question: 'What is A4 optimization?',
    answer:
      'A4 optimization is our intelligent feature that automatically restructures large flowcharts to fit perfectly on A4-sized pages. It splits complex diagrams into subgraphs with alternating layouts, making them ideal for printing, PDFs, and professional presentations.'
  }
];
