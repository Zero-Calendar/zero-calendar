
<div align="right">
  <details>
    <summary >🌐 Language</summary>
    <div>
      <div align="center">
        <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=en">English</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=zh-CN">简体中文</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=zh-TW">繁體中文</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=ja">日本語</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=ko">한국어</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=hi">हिन्दी</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=th">ไทย</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=fr">Français</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=de">Deutsch</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=es">Español</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=it">Itapano</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=ru">Русский</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=pt">Português</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=nl">Nederlands</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=pl">Polski</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=ar">العربية</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=fa">فارسی</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=tr">Türkçe</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=vi">Tiếng Việt</a>
        | <a href="https://openaitx.github.io/view.html?user=Zero-Calendar&project=zero-calendar&lang=id">Bahasa Indonesia</a>
      </div>
    </div>
  </details>
</div>

# Zero Calendar

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FZero-Calendar%2Fzero-calendar)

**An Open-Source AI-Powered Calendar for the Future of Scheduling**

## What is Zero Calendar?
Zero Calendar is an open-source AI calendar solution that gives users the power to manage their schedule intelligently while integrating with external services like Google Calendar and other calendar providers. Our goal is to modernize and improve scheduling through AI agents to truly revolutionize how we manage our time.

## Why Zero Calendar?
Most calendar services today are either closed-source, data-hungry, or lack intelligent features. Zero Calendar is different:

✅ **Open-Source** – No hidden agendas, fully transparent.  
🦾 **AI Driven** - Enhance your scheduling with AI assistants & LLMs.  
🔒 **Data Privacy First** – Your schedule, your data. Zero Calendar does not track, collect, or sell your data in any way.  
⚙️ **Self-Hosting Freedom** – Run your own calendar app with ease.  
📅 **Unified Calendar** – Connect multiple calendar providers like Google Calendar, Outlook, and more.  
🎨 **Customizable UI & Features** – Tailor your calendar experience the way you want it.  
🚀 **Developer-Friendly** – Built with extensibility and integrations in mind.  

## Tech Stack
Zero Calendar is built with modern and reliable technologies:

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Vercel KV (Redis)
- **Authentication**: NextAuth.js, Google OAuth
- **AI**: AI SDK, Groq

## Getting Started

### Prerequisites
Required Versions:
- Node.js (v18 or higher)
- npm (v9 or higher) or pnpm (v8 or higher)

Before running the application, you'll need to set up services and configure environment variables. For more details on environment variables, see the Environment Variables section.

### Setup Options

#### Quick Start Guide

1. **Clone and Install**
```bash
# Clone the repository
git clone https://github.com/Zero-Calendar/zero-calendar.git
cd zero-calendar

# Install dependencies
npm install
# or
pnpm install
```

2. **Set Up Environment**
- Copy `.env.example` to `.env.local` in project root
```bash
cp .env.example .env.local
```
- Configure your environment variables (see below)

3. **Start the App**
```bash
npm run dev
# or
pnpm dev
```

4. **Open in Browser**
- Visit http://localhost:3000

### Environment Variables
Create a `.env.local` file in the project root and configure the following variables:

```
# NextAuth
NEXTAUTH_SECRET=     # Required: Secret key for authentication (generate with `openssl rand -hex 32`)
NEXTAUTH_URL=        # Required: URL of your application (http://localhost:3000 for local dev)

# Google OAuth (Required for Google Calendar integration)
GOOGLE_CLIENT_ID=    # Required for Google Calendar integration
GOOGLE_CLIENT_SECRET=# Required for Google Calendar integration

# Vercel KV (Redis)
KV_URL=              # Required: Vercel KV URL
KV_REST_API_URL=     # Required: Vercel KV REST API URL
KV_REST_API_TOKEN=   # Required: Vercel KV REST API token
KV_REST_API_READ_ONLY_TOKEN= # Required: Vercel KV REST API read-only token

# AI Integration
GROQ_API_KEY=        # Required for AI features
```

### Google OAuth Setup (Required for Google Calendar integration)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Add the following APIs in your Google Cloud Project:
   - Google Calendar API
   - Google People API
4. Enable the Google OAuth2 API
5. Create OAuth 2.0 credentials (Web application type)
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-production-url/api/auth/callback/google`
7. Add to `.env.local`:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```
8. Add yourself as a test user:
   - Go to OAuth consent screen
   - Under 'Test users' click 'Add Users'
   - Add your email and click 'Save'

> **Warning**
>
> The authorized redirect URIs in Google Cloud Console must match exactly what you configure in the `.env.local`, including the protocol (http/https), domain, and path.

### Vercel KV Setup

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI: `npm i -g vercel`
3. Login to Vercel: `vercel login`
4. Link your project: `vercel link`
5. Create a KV database from the Vercel dashboard
6. Add the KV environment variables to your project: `vercel env pull .env.local`

## Features

- 🤖 **AI Assistant**: Interact with your calendar using natural language
- 🔄 **Google Calendar Integration**: Sync with your existing Google Calendar
- 🎨 **Customizable UI**: Dark mode and personalized settings
- 🔄 **Recurring Events**: Comprehensive support for recurring events with exceptions
- 🌐 **Timezone Management**: Full timezone support for global scheduling
- 📤 **Import/Export**: Import and export calendar data in ICS and CSV formats
- ⌨️ **Keyboard Shortcuts**: Power user shortcuts for efficient calendar management
- 🔔 **Event Management**: Create, edit, and delete events with ease
- 🔒 **Secure Authentication**: Login with email/password or Google OAuth

### Keyboard Shortcuts

Zero Calendar includes keyboard shortcuts for power users:

| Shortcut | Action |
|----------|--------|
| `←` | Previous month |
| `→` | Next month |
| `T` | Go to today |
| `N` | Create new event |
| `?` | Show keyboard shortcuts |
| `/` | Focus search |
| `M` | Switch to month view |
| `W` | Switch to week view |
| `D` | Switch to day view |
| `A` | Toggle AI assistant |
| `S` | Go to settings |
| `Esc` | Close dialogs |

## Contribute
Please refer to the [contributing guide](.github/CONTRIBUTING.md).

## License

Zero Calendar is open-source software licensed under the [GPLv3 license](LICENSE.md).
