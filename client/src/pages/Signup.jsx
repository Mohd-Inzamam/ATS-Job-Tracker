import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      setSubmitted(true); // show success message
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  // ✅ Show confirmation screen after successful signup
  if (submitted) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Check Your Email ✉️</h2>
          <p className="auth-subtitle">
            We sent a verification link to <strong>{form.email}</strong>. Please
            verify your email before logging in.
          </p>
          <button
            className="btn-primary full-width"
            onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the ATS platform</p>

        {error && <p className="auth-error">{error}</p>}

        <div className="input-group">
          <span className="material-symbols-outlined">person</span>
          <input
            placeholder="Full Name"
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="input-group">
          <span className="material-symbols-outlined">mail</span>
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="input-group">
          <span className="material-symbols-outlined">lock</span>
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="btn-primary full-width">Sign Up</button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function Signup() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState("");

//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await signup(form);
//       setSubmitted(true); // show success message
//     } catch (err) {
//       setError(err.message || "Registration failed. Please try again.");
//     }
//   };

//   return (
//     <div className="auth-wrapper">
//       <form className="auth-card" onSubmit={handleSubmit}>
//         <h2>Create Account</h2>
//         <p className="auth-subtitle">Join the ATS platform</p>

//         <div className="input-group">
//           <span className="material-symbols-outlined">person</span>
//           <input
//             placeholder="Full Name"
//             required
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />
//         </div>

//         <div className="input-group">
//           <span className="material-symbols-outlined">mail</span>
//           <input
//             type="email"
//             placeholder="Email"
//             required
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />
//         </div>

//         <div className="input-group">
//           <span className="material-symbols-outlined">lock</span>
//           <input
//             type="password"
//             placeholder="Password"
//             required
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//           />
//         </div>

//         <button className="btn-primary full-width">Sign Up</button>

//         <p className="auth-switch">
//           Already have an account? <Link to="/login">Login</Link>
//         </p>
//       </form>
//     </div>
//   );
// }
