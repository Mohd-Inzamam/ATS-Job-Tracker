import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ATSUpload from "./pages/ATSUpload";
import ATSResult from "./pages/ATSResult";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/global.css";
import ResumeCard from "./components/ResumeCard";
import Resumes from "./pages/Resume";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ats" element={<ATSUpload />} />
      <Route path="/ats/result" element={<ATSResult />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <Resumes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resumes/:id"
        element={
          <ProtectedRoute>
            <ResumeCard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
