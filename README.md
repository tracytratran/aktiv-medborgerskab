# Aktiv Medborgerskab Quiz App

A TypeScript and React-based quiz application with Tailwind CSS for studying Danish citizenship questions.

## Features

- Interactive quiz with questions from the Danish citizenship test
- TypeScript for type safety and better developer experience
- Tailwind CSS for modern, responsive design
- Immediate feedback on answers
- Progress tracking
- Final score and personalized feedback
- Option to review incorrect answers
- Randomized questions for each quiz session

## Technology Stack

- React 18
- TypeScript 4.9+
- Tailwind CSS 3.3
- Modern JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Navigate to the quiz-app directory:
   ```
   cd /Users/chriskhong/Documents/Programming/medborgerskab/web/quiz-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The app will open in your browser at [http://localhost:3000](http://localhost:3000)

## How to Use

1. Read each question and select your answer by clicking one of the options
2. You'll receive immediate feedback on your answer
3. The app will automatically proceed to the next question
4. After completing all questions, you'll see your final score
5. If you had any incorrect answers, you can review them
6. Click "Start New Quiz" to begin a new session with randomized questions

## Project Structure

```
src/
├── components/
│   ├── Quiz.tsx        # Quiz component for showing questions and options
│   └── Results.tsx     # Results component for showing score and review
├── questions-bank.json # Database of quiz questions
├── types.ts            # TypeScript interfaces
├── App.tsx             # Main application component
└── index.tsx           # Entry point
```
