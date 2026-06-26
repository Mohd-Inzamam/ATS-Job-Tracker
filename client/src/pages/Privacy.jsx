import PublicNavbar from "../components/PublicNavbar";
import Footer from "../pages/Footer";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      "Account information: name, email address, and password (encrypted) when you create an account.",
      "Resume content: the text and files you upload for ATS scoring and job tracking purposes.",
      "Usage data: pages visited, features used, and general analytics to help us improve the product.",
      "We do not collect more personal information than is necessary to provide the service.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To provide ATS scoring, resume–JD matching, and application tracking features.",
      "To send essential account emails — verification, password resets, and service updates.",
      "To improve our scoring algorithms and overall product experience.",
      "We never sell your personal data or resume content to third parties.",
    ],
  },
  {
    title: "3. Resume Data Specifically",
    body: [
      "Resumes uploaded through the public ATS Checker (no account) are processed in memory and are not permanently stored.",
      "Resumes uploaded by registered users are stored securely and associated only with your account.",
      "You can delete any resume from your account at any time from the Resumes page.",
      "Deleting your account permanently removes all associated resume data within 30 days.",
    ],
  },
  {
    title: "4. Data Security",
    body: [
      "Passwords are hashed using industry-standard encryption — we never store plain-text passwords.",
      "All data is transmitted over HTTPS.",
      "Access to user data is restricted to what's necessary for the application to function.",
    ],
  },
  {
    title: "5. Third-Party Services",
    body: [
      "We use AI providers (such as Groq) to power semantic resume analysis. Resume text may be sent to these providers for processing but is not stored by them beyond the request.",
      "We do not use third-party advertising trackers.",
    ],
  },
  {
    title: "6. Your Rights",
    body: [
      "You can access, update, or delete your personal data at any time from your account settings.",
      "You can request a full export or deletion of your data by contacting us.",
      "You can unsubscribe from non-essential emails at any time.",
    ],
  },
  {
    title: "7. Changes to This Policy",
    body: [
      "We may update this policy as the product evolves. Material changes will be communicated via email or an in-app notice.",
    ],
  },
];

export default function Privacy() {
  return (
    <>
      <PublicNavbar />
      <div className="legal-page">
        <div className="legal-header">
          <span className="landing-eyebrow">Legal</span>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: June 2026</p>
        </div>

        <div className="legal-body">
          <p className="legal-intro">
            ATSPro ("we", "us", "our") respects your privacy. This policy
            explains what data we collect, how we use it, and the choices you
            have. By using ATSPro, you agree to the practices described here.
          </p>

          {SECTIONS.map((sec) => (
            <div key={sec.title} className="legal-section">
              <h2>{sec.title}</h2>
              <ul>
                {sec.body.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="legal-contact-note">
            <p>
              Questions about this policy? <a href="/contact">Contact us</a> —
              we're happy to clarify anything.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
