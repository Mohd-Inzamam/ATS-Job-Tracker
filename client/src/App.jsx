import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ATSUpload from "./pages/ATSUpload";
import ATSResult from "./pages/ATSResult";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/global.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ats" element={<ATSUpload />} />
      <Route path="/ats/result" element={<ATSResult />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
