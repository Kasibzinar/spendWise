# 💰 SpendWise — Personal Expense Tracker

\<p align="center">   \<strong>Track your money. Understand your spending. Stay in control.\</strong> \</p>

## 🌟 About SpendWise

**SpendWise** is a simple personal finance application built with TypeScript. It helps users record their income and expenses, monitor their balance, and understand how they spend their money.

The application runs in the browser and stores transaction data locally using **Local Storage**.

## ✨ Features

- ➕ Add income and expense transactions.
- ✏️ Edit existing transactions.
- 🗑️ Delete transactions.
- 📊 View total income, expenses, and balance.
- 🏷️ Organize transactions by category.
- 🔎 Search and filter transactions.
- 💾 Save data using browser Local Storage.
- 📱 Responsive interface for different screen sizes.

## 🛠️ Built With

- **HTML5** — Application structure.
- **CSS3** — Styling and responsive design.
- **TypeScript** — Application logic and type safety.
- **Vite** — Development server and build tool.
- **Browser Local Storage** — Local data persistence.

## 📁 Project Structure

```text
SpendWise/
│
├── public/
│   └── spendWiseLogo.svg
│
├── src/
│   ├── data/
│   │   └── categories.ts
│   │
│   ├── services/
│   │   ├── financialAnalytics.ts
│   │   ├── transactionManager.ts
│   │   └── transactionStorage.ts
│   │
│   ├── types/
│   │   ├── category.ts
│   │   ├── transaction-manager.ts
│   │   └── transaction.ts
│   │
│   ├── ui/
│   │   ├── helpers.ts
│   │   ├── renderDashboard.ts
│   │   ├── renderTransactions.ts
│   │   └── transactionForm.ts
│   │
│   ├── main.ts
│   └── style.css
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

Follow these steps to run SpendWise on your computer.

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Open the project folder

```bash
cd SpendWise
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal to use the application.

## 🏗️ Production Build

To create an optimized production version:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🔐 Data and Privacy

SpendWise currently uses browser Local Storage to save transactions.

- Transaction data is stored in the user's browser.
- No account or login is required.
- Data is not automatically synchronized between devices.
- Clearing the browser's site data may delete saved transactions.

**Note:** Avoid entering sensitive financial or personal information into this demonstration application.

## 🎯 Project Purpose

SpendWise was developed as a practical TypeScript learning project to apply programming concepts such as:

- Types and Interfaces
- Union Types
- Classes and Object-Oriented Programming
- Array Methods
- DOM Manipulation
- Form Validation
- Local Storage
- Modular Code Organization

## 👨‍💻 Author

Created as a personal Computer Science learning project.

---

\<p align="center">   \<strong>💚 Spend wisely. Keep track. Make better decisions.\</strong> \</p>
