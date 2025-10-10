# UltraFlow

A Next.js application that converts articles into beautiful flowcharts using AI-powered analysis with Google Gemini.

## Features

- 🤖 AI-powered article analysis using Google Gemini
- 📊 Automatic flowchart generation from text
- 🎨 Customizable themes and styling
- 📄 **A4 page size optimization** - Automatically restructures large flowcharts to fit A4 dimensions
- 🔄 **Intelligent subgraph splitting** - Optimizes space by alternating vertical/horizontal layouts
- 💾 Export as SVG or PNG with A4 optimization
- 🎭 Interactive Mermaid editor with live preview
- 📚 **Article caching** - Client-side local storage of articles using IndexedDB
- 🔍 **Search & filter** - Quickly find and reuse previous articles
- 📈 **Statistics dashboard** - Track your article usage and history
- ⚡ Built with Next.js 15 and React 19
- 🎯 TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ultraflow.git
cd ultraflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is using Vercel:

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ultraflow)

### Manual Deployment

```bash
npm run build
npm start
```

## Project Structure

```
ultraflow/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── flowchart/    # Flowchart page
│   │   └── model-config/ # Model configuration page
│   ├── components/       # React components
│   └── lib/              # Library files and utilities
├── public/               # Static assets
└── flowcharts/          # Generated flowcharts
```

## API Routes

### POST `/api/article-to-flowchart`
Converts an article to a flowchart diagram.

### POST `/api/apply-theme-to-diagram`
Applies a custom theme to a flowchart diagram.

### POST `/api/gemini`
Direct access to Gemini AI for text generation.

## Technologies Used

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Gemini AI](https://ai.google.dev/) - AI processing
- [Mermaid](https://mermaid.js.org/) - Diagram generation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Documentation

- [Gemini Setup Guide](./GEMINI_SETUP.md) - Detailed Gemini API setup instructions
- [A4 Optimization Guide](./A4_OPTIMIZATION_GUIDE.md) - How to use A4 page size optimization
- [Article Cache Guide](./ARTICLE_CACHE_GUIDE.md) - Local article storage and management
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [AI Theme Application](./AI_THEME_APPLICATION.md) - Theme customization guide

## Support

For support, please open an issue in the GitHub repository or refer to the documentation files above.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Diagrams generated using [Mermaid](https://mermaid.js.org/)
# ultraflow
# ultraflow