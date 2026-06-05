import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ResumeBuilder from "./components/ResumeBuilder/ResumeBuilder";
import ErrorPage from "./components/Error";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/builder",
    element: <ResumeBuilder />,
  },
]);

function App() {
  return (
    <main className="main-container">
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
