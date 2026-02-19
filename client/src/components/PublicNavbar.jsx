import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`public-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">▲</span>
          ATSPro
        </Link>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink
            to="/ats"
            className="nav-item"
            onClick={() => setOpen(false)}>
            ATS Checker
          </NavLink>

          {!user ? (
            <>
              <NavLink
                to="/login"
                className="nav-item"
                onClick={() => setOpen(false)}>
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="nav-cta"
                onClick={() => setOpen(false)}>
                Sign up
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/dashboard"
              className="nav-cta"
              onClick={() => setOpen(false)}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div
          className={`hamburger ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </header>
  );
}
