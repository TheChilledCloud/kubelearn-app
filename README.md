# KubeLearn - Interactive Kubernetes Learning Platform

Welcome to **KubeLearn**, a modern, interactive web application designed to help users learn Kubernetes from foundational concepts to advanced topics.

## 🚀 Features

- **Gamified Learning Experience**: Engage with flashcards and interactive multiple-choice quizzes.
- **Terminal Simulation**: Practice Kubernetes commands in a simulated environment with progressive hints and a "reveal solution" feature.
- **Multilingual (EN/DE)**: Switch between English and German — both the UI and all learning content are fully translated.
- **Persistent Progress**: Your learning progress and quiz results are securely saved locally using an embedded SQLite database. Progress is preserved across language switches.
- **Responsive Dark-Mode Interface**: Enjoy a premium, accessible user interface optimized for learning.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: SQLite
- **Deployment**: Docker & Docker Compose

## 🐳 Running Locally with Docker

The easiest way to run KubeLearn locally is using Docker Compose. This ensures the application and its database volume are perfectly configured.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kubelearn
   ```

2. **Run with Docker Compose:**
   ```bash
   docker compose up --build -d
   ```

3. **Access the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## 💻 Manual Development Setup

If you prefer to run the development server manually:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🤝 HAVE FUN!!!


