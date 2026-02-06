import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ATSUpload from "./pages/ATSUpload";
import ATSResult from "./pages/ATSResult";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ats" element={<ATSUpload />} />
      <Route path="/ats/result" element={<ATSResult />} />
    </Routes>
  );
}
