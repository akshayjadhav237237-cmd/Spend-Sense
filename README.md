# 💸 SpendSense — Student Finance App

> A beautiful, mobile-first Personal Finance PWA built for students. Track expenses, manage lendings, set savings goals, and get AI-powered financial insights — all offline-capable and installable as a native Android app.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://spendsense-akshay-jadhavs-projects-b3a18432.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-blueviolet?logo=googlechrome)](https://web.dev/progressive-web-apps/)

---

## ✨ Features

### 🏠 Home Tab
- Personalized greeting with current month spending
- Live budget progress bar with daily allowance
- 6-month spending sparkline chart
- Daily streak tracker
- Quick-access recent transactions
- Pending lendings summary card

### 💳 Expenses Tab
- Add expenses with category, amount, description, date & receipt photo
- Month navigator with category filter chips
- Search and sort (newest / oldest / highest)
- Swipe-to-delete and bulk select/delete
- Fullscreen receipt viewer (React Portal-based)

### 🤝 Lend Tab
- Lending ledger with pending / partial / repaid status
- Record partial or full repayments with payment history
- Expandable payment history per lending card
- Confirm full repayment with undo support
- WhatsApp remind button for borrowers
- Contact picker integration (mobile)

### 📊 Summary Tab
- Monthly stats grid (total, average, highest, transactions)
- Category bar chart with percentage breakdown
- 6-month SVG line chart with trend indicator
- AI-generated financial insights
- Savings goals with progress bars and top-up modal

### 🤖 AI Chat
- Rule-based AI financial advisor with contextual insights
- Quick-prompt chips (spending tips, saving goals, etc.)
- Typing indicator animation

### ⚙️ Settings Sheet
- Name, currency symbol & budget configuration
- Dark / light / system theme toggle
- Recurring expenses management
- Export (JSON) / Import / Clear data
- App version display

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Storage | `localStorage` (with `ss_` prefix) |
| PWA | Custom Service Worker + Web App Manifest |
| Android | Bubblewrap CLI (TWA) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── SpendSense.jsx          # App shell, state hydration, ErrorBoundary
├── main.jsx                # React root entry
├── index.css               # Global + Tailwind
├── utils.js                # Formatting, date, ID helpers
├── components/
│   └── GlobalComponents.jsx  # BottomSheet, BottomNav, ConfirmDialog, Toast
└── views/
    ├── HomeView.jsx          # Home tab
    ├── ExpensesView.jsx      # Expenses tab + AddExpenseModal
    ├── LendView.jsx          # Lend tab + AddLendModal + PartialReturnModal
    ├── SummaryView.jsx       # Summary tab + AddGoalModal
    ├── AiInsightsView.jsx    # AI Chat tab
    └── SettingsSheet.jsx     # Settings bottom sheet
public/
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker (offline cache)
├── icon-192.png             # PWA icon
├── icon-512.png             # PWA icon
└── .well-known/
    └── assetlinks.json      # Digital Asset Links (Android TWA)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Run Locally

```bash
git clone https://github.com/akshayjadhav237237/spendsense.git
cd spendsense
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 📱 Android APK

SpendSense ships as a **TWA (Trusted Web Activity)** Android app built with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).

### Build the APK yourself

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize (downloads JDK + Android SDK automatically)
mkdir spendsense-apk && cd spendsense-apk
bubblewrap init --manifest https://spendsense-akshay-jadhavs-projects-b3a18432.vercel.app/manifest.json

# Build signed APK + AAB
bubblewrap build
```

Output files:
- `app-release-signed.apk` — install directly on Android
- `app-release-bundle.aab` — submit to Google Play Store

### Digital Asset Links
The `/.well-known/assetlinks.json` is deployed on Vercel to verify domain ownership and **hide the browser URL bar** in the TWA.

---

## 🧠 Key Design Decisions

| Decision | Reason |
|----------|--------|
| `localStorage` only | Zero backend — works fully offline |
| React class `ErrorBoundary` | Catches rendering crashes → shows recovery screen instead of blank page |
| `try/catch` on all form submits | Prevents state corruption on bad input |
| Object maps for toggle state (`expandedItems`, `swipedItems`) | Avoids illegal `useState` inside `.map()` (Rules of Hooks) |
| React Portal for receipt viewer | Bypasses CSS stacking context issues from bottom sheets |

---

## 🌐 Deployment

Deployed on **Vercel** with automatic production builds.

🔗 **Live URL:** https://spendsense-akshay-jadhavs-projects-b3a18432.vercel.app

---

## 📄 License

MIT © Akshay Jadhav




NOTE: IF THE LINK YOU OPENED IS SHOWING A BLANK SCREEN THEN PRESS CTRL + SHIFT + R. 
