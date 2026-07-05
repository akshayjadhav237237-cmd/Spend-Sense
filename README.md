# 💸 SpendSense — Offline-First Student Finance App

> A gorgeous, mobile-first Personal Finance PWA built specifically for students. Track expenses, manage peer lendings, monitor savings goals, and chat with an AI-powered financial advisor — all 100% offline, private, and installable on Android.

---

<p align="center">
  <a href="https://spendsense-plum.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel-6C63FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/akshayjadhav237237-cmd/Spend-Sense">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" />
  </a>
  <img src="https://img.shields.io/badge/PWA-Ready-00C853?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Version-1.2--Stable-blue?style=for-the-badge" alt="Version 1.2" />
</p>

---

## ✨ Features (v1.2 Release)

### 🏠 Dashboard & Activity
- **Interactive SVG Line Graph:** Plot your daily expenses (red) and lendings (teal) over the last 30 days. Click on any data point to view transaction details inside a dynamic tooltip.
- **Monthly Budget Limit Indicator:** Displays progress bars that shift color dynamically (Green ➔ Yellow ➔ Red) based on budget consumption.
- **Daily Streak Badge:** Rewards consistent expense tracking with motivational fire/trophy badges.
- **Quick Stats:** Instant summary of your monthly spending and outstanding lent amount.
- **Recent Activity Feed:** Combined chronology of your latest expenses and transactions.

### 💳 Expense Tracker
- **Rich Multi-categorization:** Match purchases to 12 curated categories with customized emojis and hex color tokens.
- **Receipt Photo Attachment:** Snap and view receipt photos using device cameras, complete with a fullscreen image modal.
- **Flexible Filters & Sorting:** Easily filter by month and category chips, and sort by date or amount.
- **Bulk Selection Mode:** Clean up multiple transactions simultaneously with bulk delete utilities.

### 🤝 Debt & Lending Ledger (Peer-to-Peer)
- **Borrower Cards:** Transactions grouped by person with visual progress bars indicating outstanding debt.
- **Partial Repayments:** Log partial returns with notes and exact dates, retaining structural payment logs.
- **Itemized WhatsApp Reminders:** Send detailed, formatted messages via WhatsApp detailing original borrowing date, reason, payment history, and the remaining balance.
- **Contact Picker Integration:** Seamlessly import friends' names and phone numbers directly from your device's native address book.

### 📊 Summary & Savings Goals
- **Spending by Category Graph:** Interactive SVG line graph plotting individual category trends over the current month.
- **90-Day Trendline:** Interactive graph mapping your daily overall spending over the last 90 days.
- **Personalized Insights:** Automatic indicators displaying month-over-month growth, top category distribution, and loan counts.
- **Goal Milestones:** Establish savings goals with customizable deadlines, custom emojis, target milestones, and direct top-up modals.

### 🤖 AI Financial Advisor
- **Contextual Advisor:** Local rules-based AI that interprets your current expenses, savings goals, and lendings to deliver actionable budget advice.
- **Suggested Prompts:** Interactive chips for instant inquiries (e.g., "Analyze my budget", "Tips to save money").
- **Private & Local:** No API keys required, keeping your conversations private.

### ⚙️ Settings & Data Portability
- **Auto-Backups:** Automatically backs up data locally to `localStorage` on every app open. Retains the last 5 backups (automatically excludes heavy receipt photos to stay under storage limits).
- **One-Click Restore:** Browse and restore historical backups directly from Settings with confirmation popups.
- **Data Portability:** Export your entire dashboard state as a readable `.json` file, or import backups to restore settings instantly.
- **Dark Mode Support:** Exhaustive style overrides covering every border, card, nav, modal, and text weight for optimal readability.

---

## 🛠 Tech Stack

| Layer | Technology | Key Highlights |
|---|---|---|
| **Frontend Framework** | React 18 + Vite 6 | Fast HMR, optimized production chunks |
| **Styling** | Tailwind CSS 3 | Utility-first layouts, responsive grids |
| **Icons** | Lucide React | Clean, modern vector outline icons |
| **State & Storage** | Local-First (`localStorage`) | Secure, private, works completely offline |
| **Offline Engine** | Service Worker + Manifest | Asset caching, native app behavior |
| **Android TWA** | Bubblewrap CLI | Packages the PWA into a native Android APK |
| **Hosting & CI/CD** | Vercel | Instant production builds on git push |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/akshayjadhav237237-cmd/Spend-Sense.git
   cd Spend-Sense
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local Vite dev server:
   ```bash
   npm run dev
   ```

The application will launch locally at `http://localhost:5173`.

### Build for Production
To generate an optimized bundle in the `/dist` directory:
```bash
npm run build
```

---

## 📱 Native Android App (TWA)

SpendSense is configured as a **Trusted Web Activity (TWA)**, allowing you to package it into a native `.apk` file using Bubblewrap.

### Build the APK

1. Install the Bubblewrap CLI globally:
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. Initialize the APK project pointing to your live production manifest:
   ```bash
   mkdir spendsense-apk && cd spendsense-apk
   bubblewrap init --manifest https://spendsense-plum.vercel.app/manifest.json
   ```

3. Build and sign your release package:
   ```bash
   bubblewrap build
   ```

This produces:
- `app-release-signed.apk` (installable directly on mobile devices)
- `app-release-bundle.aab` (ready for uploading to the Google Play Store)

---

## 🛡️ Stability & Resiliency Rules

To keep the application crash-free, the codebase strictly implements:
- **ErrorBoundary Wrapper:** Captures React rendering issues globally and provides "Try Again" or "Reset App" recovery paths.
- **Lazy Initialization:** Protects against storage corruption by wrapping all `localStorage.getItem` reads in structured parser handlers.
- **Safe Persistence:** Saves state using `useEffect` handlers wrapped in isolated try/catch statements.
- **Strict Hooks Rules:** Avoids illegal conditional hooks inside map/filter functions by maintaining unified top-level dictionaries (e.g. `expandedPersons`).
- **Flexible Scroll Mechanics:** Utilizes dynamic viewport scroll areas inside modal sheets (`max-height: 90vh`) to ensure submit buttons are never pushed below bottom navigation bars.

---

## 📄 License & Terms

- **License:** Distributed under the **Apache License 2.0**. See [LICENSE](LICENSE) for more details.
- **Code of Conduct:** We expect all contributors and participants to follow our code policies. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.
