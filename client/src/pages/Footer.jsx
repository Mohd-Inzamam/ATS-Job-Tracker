import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        {/* Brand column */}
        <div className="footer-col footer-col-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">▲</span>
            ATSPro
          </Link>
          <p className="footer-tagline">
            Helping job seekers beat the ATS and land more interviews — one
            resume at a time.
          </p>
          <div className="footer-social">
            <a
              href="https://github.com/Mohd-Inzamam/ATS-Job-Tracker"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.1 3.29 9.42 7.86 10.96.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.68-1.29-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.65.79.55A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Product column */}
        <div className="footer-col">
          <p className="footer-col-title">Product</p>
          <Link to="/ats">ATS Checker</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/signup">Get Started</Link>
        </div>

        {/* Company column */}
        <div className="footer-col">
          <p className="footer-col-title">Company</p>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <a
            href="https://github.com/Mohd-Inzamam/ATS-Job-Tracker"
            target="_blank"
            rel="noopener noreferrer">
            GitHub
          </a>
        </div>

        {/* Legal column */}
        <div className="footer-col">
          <p className="footer-col-title">Legal</p>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} ATSPro. Built for job seekers.</span>
        <span className="footer-bottom-dot">·</span>
        <span>Made with care in India</span>
      </div>
    </footer>
  );
}
