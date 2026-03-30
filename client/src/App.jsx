import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ATSUpload from "./pages/ATSUpload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import ResumeList from "./pages/ResumeList";
import "./styles/global.css";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/ats" element={<ATSUpload />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
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
            <ResumeList />
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
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// import { Routes, Route } from "react-router-dom";
// import Landing from "./pages/Landing";
// import ATSUpload from "./pages/ATSUpload";

// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Dashboard from "./pages/Dashboard";
// import ProtectedRoute from "./components/ProtectedRoute";
// import "./styles/global.css";

// import Onboarding from "./pages/Onboarding";
// import Profile from "./pages/Profile";
// // import PublicNavbar from "./components/PublicNavbar";
// // import Sidebar from "./components/Sidebar";
// import Applications from "./pages/Applications";
// import ResumeList from "./pages/ResumeList";

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Landing />} />
//       <Route path="/ats" element={<ATSUpload />} />
//       {/* <Route path="/ats/result" element={<ATSResult />} /> */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/signup" element={<Signup />} />
//       {/* <Route path="/publicnav" element={<PublicNavbar />} /> */}

//       {/* Protected routes */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/resumes"
//         element={
//           <ProtectedRoute>
//             <ResumeList />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/resumes/:id"
//         element={
//           <ProtectedRoute>
//             <ResumeCard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/onboarding"
//         element={
//           <ProtectedRoute>
//             <Onboarding />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/profile"
//         element={
//           <ProtectedRoute>
//             <Profile />
//           </ProtectedRoute>
//         }
//       />

//       {/* <Route
//         path="/sidebar"
//         element={
//           <ProtectedRoute>
//             <Sidebar />
//           </ProtectedRoute>
//         }
//       /> */}

//       <Route
//         path="/applications"
//         element={
//           <ProtectedRoute>
//             <Applications />
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   );
// }
