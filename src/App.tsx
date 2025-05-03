import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ReviewHistoryPage from "./pages/ReviewHistoryPage";
import QuizSelectorPage from "./pages/QuizSelectorPage";

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Layout>
          <Routes>
            <Route path="/" element={<QuizSelectorPage />} />
            <Route path="/results" element={<ReviewHistoryPage />} />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
};

export default App;
