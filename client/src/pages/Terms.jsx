import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using ATSPro, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "2. Description of Service",
    body: [
      "ATSPro provides ATS resume scoring, job application tracking, resume–job description matching, and related career tools.",
      "The public ATS Checker is available without an account. Full features require a registered account.",
    ],
  },
  {
    title: "3. Account Responsibilities",
    body: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You must provide accurate information when creating an account.",
      "You are responsible for all activity that occurs under your account.",
    ],
  },
  {
    title: "4. Acceptable Use",
    body: [
      "You agree not to use ATSPro to upload malicious files, attempt to disrupt the service, or scrape data at scale.",
      "You agree not to misrepresent your identity or the content of resumes you upload.",
      "We reserve the right to suspend accounts that violate these terms.",
    ],
  },
  {
    title: "5. Subscription & Billing",
    body: [
      "Free tier usage limits are described on our Pricing page and may change with notice.",
      "Paid plans renew automatically unless cancelled before the renewal date.",
      "You can cancel your subscription at any time from Settings — you'll retain access until the end of the current billing period.",
    ],
  },
  {
    title: "6. ATS Scoring Disclaimer",
    body: [
      "Our ATS score is an estimate based on rule-based analysis and AI-assisted review of writing quality. It is intended as guidance, not a guarantee of outcomes with any specific employer's ATS software.",
      "We do not guarantee interview or job offer outcomes from using ATSPro.",
    ],
  },
  {
    title: "7. Intellectual Property",
    body: [
      "You retain full ownership of your resume content and any data you upload.",
      "ATSPro's branding, design, and underlying scoring engine are the property of ATSPro and may not be copied or redistributed without permission.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      'ATSPro is provided "as is" without warranties of any kind.',
      "We are not liable for any indirect, incidental, or consequential damages arising from use of the service.",
    ],
  },
  {
    title: "9. Changes to These Terms",
    body: [
      "We may update these terms periodically. Continued use of ATSPro after changes constitutes acceptance of the revised terms.",
    ],
  },
];

export default function Terms() {
  return (
    <>
      <PublicNavbar />
      <div className="legal-page">
        <div className="legal-header">
          <span className="landing-eyebrow">Legal</span>
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: June 2026</p>
        </div>

        <div className="legal-body">
          <p className="legal-intro">
            These Terms of Service govern your use of ATSPro. Please read them
            carefully before using the platform.
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
              Questions about these terms? <a href="/contact">Contact us</a> —
              we're happy to help.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
