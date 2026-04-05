<div align="center">

<img src="public/icon-512.png" alt="SpendSense Logo" width="100" height="100" style="border-radius: 22px"/>

# SpendSense 💸

**The smart finance tracker built for students.**  
Track expenses, manage lendings, set savings goals, and get AI-powered insights — all offline, all private.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-▶%20Open%20App-6C63FF?style=for-the-badge&logo=vercel)](https://spendsense-acp044rkq-akshay-jadhavs-projects-b3a18432.vercel.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-51CF66?style=for-the-badge&logo=googlechrome)](#-install-on-mobile)
[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Spending streak, budget progress bar, 7-day sparkline chart, recent activity feed |
| 💳 **Expense Tracker** | Add/delete expenses with category, photo receipt, date. Swipe-to-delete, bulk delete, month navigation |
| 🤝 **Lend Tracker** | Track who owes you money. Partial returns, overdue alerts, WhatsApp reminder integration |
| 📈 **Summary & Analytics** | 6-month trend chart, category bar chart, MoM comparison, personalized insights |
| 🤖 **AI Chat** | Rule-based local AI that analyzes your spending and answers natural language finance questions |
| 🎯 **Savings Goals** | Set goals with emoji, target amount, deadline, and color. Add funds progressively |
| 🔁 **Recurring Expenses** | Schedule daily/weekly/monthly expenses — auto-added when due |
| 🌙 **Dark Mode** | Full dark theme with custom CSS design token system |
| 📤 **Export / Import** | Backup your data as JSON. Restore it anytime on any device |
| 📱 **PWA** | Installable on Android & iPhone. Works fully offline after install |

---

## 📱 Install on Mobile

**The app works offline once installed — no internet needed.**

### Android
1. Open the [Live Demo](https://spendsense-acp044rkq-akshay-jadhavs-projects-b3a18432.vercel.app) in **Chrome**
2. Tap ⋮ → **"Add to Home Screen"** → Install

### iPhone
1. Open the link in **Safari**
2. Tap the **Share** icon (□↑) → **"Add to Home Screen"** → Add

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev) + [Vite](https://vitejs.dev) |
| Styling | [Tailwind CSS](https://tailwindcss.com) + Custom CSS tokens |
| Icons | [Lucide React](https://lucide.dev) |
| Storage | `localStorage` — 100% client-side, zero backend |
| Hosting | [Vercel](https://vercel.com) |
| PWA | Web App Manifest + Service Worker |

---

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/akshayjadhav237237-cmd/spendsense.git
cd spendsense

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Run on your phone (same WiFi)
```bash
npm run dev -- --host
# Then open http://<your-local-ip>:5173 on your phone
```

---

## 📁 Project Structure

```
src/
├── SpendSense.jsx          # App shell · state management · routing
├── utils.js                # Constants · formatters · AI engine · hooks
├── main.jsx                # Entry point · service worker registration
├── components/
│   └── GlobalComponents.jsx  # BottomNav · OfflineBanner · Toast · BottomSheet
└── views/
    ├── HomeView.jsx          # Dashboard
    ├── ExpensesView.jsx       # Expense CRUD
    ├── LendView.jsx           # Lending tracker
    ├── SummaryView.jsx        # Analytics & goals
    ├── AiInsightsView.jsx     # AI chat
    └── SettingsSheet.jsx      # Settings · recurring · import/export
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline caching)
├── icon-192.png            # App icon
└── icon-512.png            # App icon (large)
```

---

## 🔒 Privacy

SpendSense stores **all data locally in your browser** using `localStorage`.  
No servers. No accounts. No data leaves your device.

---

## 📄 License

MIT © [Akshay Jadhav](https://github.com/akshayjadhav237237-cmd)

---

<div align="center">
  Made with ❤️ for students who actually want to know where their money went.
</div>
