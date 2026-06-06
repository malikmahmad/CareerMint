import { HashRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ResumeBuilder from "./components/ResumeBuilder/ResumeBuilder";
import ErrorPage from "./components/Error";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <main className="main-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/builder" element={<ResumeBuilder />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
    </HashRouter>
  );
}

export default App;