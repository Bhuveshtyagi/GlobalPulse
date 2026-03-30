# GlobalPulse 🌍
**Real-Time Global Intelligence & AI Analytics Platform**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Running_on_Vercel-black?style=for-the-badge&logo=vercel)](https://global-pulse-tau.vercel.app/)

GlobalPulse is a high-fidelity, AI-driven intelligence engine. It continuously aggregates breaking news from 190+ countries, executing automated geopolitical summaries, and visually plotting global incidents onto an interactive 3D command center.

![GlobalPulse](/Users/bhuvesh/.gemini/antigravity/brain/6ff92266-2dff-4101-8a45-86ce5e9705c5/live_debug_after_env_1774844747635.webp) <!-- Placeholder for demo image -->

## 🚀 Key Features

- **Interactive 3D Command Center**: A WebGL-powered 3D globe rendering accurately mapped country polygons. Users can hover for localized data and click to extract instant regional intelligence.
- **AI-Powered Synthesis**: Integration with high-speed LLMs (via PicoAPI) allowing single-click executive summaries of ongoing geopolitical or economic events in any given region.
- **Zero-Cost Background Pipeline**: A custom user-triggered, smart-throttled "cron" system that updates intelligence feeds globally without requiring paid serverless execution tiers.
- **Financial Market Ticker**: Live streaming data tracking major global indices and commodities.
- **VIP "Glass-morphic" Aesthetics**: A premium, dark-mode terminal UI built for professionals, utilizing modern design tokens, blur-filters, and tech-focused typography.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) + React 19
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **3D Visualization**: [`react-globe.gl`](https://globe.gl/) (Three.js WebGL)
- **Styling**: TailwindCSS, Lucide-React
- **Intelligence Providers**: NewsData.io (Aggregation), PicoAPI (LLM Summarization)

## 💡 Where Can This Tech Be Implemented?

The architecture and design patterns utilized in GlobalPulse are highly adaptable for several enterprise domains:
1. **Financial Intelligence Dashboards**: Tracking global geopolitical events to estimate macro-economic risk and supply chain disruptions.
2. **OSINT (Open Source Intelligence) Platforms**: Providing a centralized, rapid-response visualizer for analysts monitoring global conflicts or global health incidents.
3. **Executive Corporate Dashboards**: Globalized companies tracking regional sentiment where they have heavy infrastructure or employee footprints.
4. **Educational Tools**: Visualizing history, political science, and global studies in an engaging, interactive format.

## ⚙️ Local Development Requirements

To run this platform locally, you will need the following API Keys set in your `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEWSDATA_API_KEY`
- `PICO_API_KEY`
- `CRON_SECRET_KEY` / `NEXT_PUBLIC_CRON_SECRET_KEY`

```bash
# Clone and install dependencies
git clone https://github.com/Bhuveshtyagi/GlobalPulse
cd news-app
npm install --legacy-peer-deps

# Run the local intelligence server
npm run dev
```

---

## ⚠️ Legal Disclaimer

**Content Ownership**: The news headlines, summaries, photographic images, and financial market data displayed on this application are aggressively aggregated from public third-party sources (such as NewsData.io, Google News RSS, and Yahoo Finance) via automated scraping and APIs. 

**We do not own, write, endorse, or verify the accuracy of the aggregated content.** All intellectual property, trademarks, and copyrights belong strictly to their respective original publishers and authors. This platform is constructed purely as a technical demonstration of AI assimilation and 3D data visualization.
