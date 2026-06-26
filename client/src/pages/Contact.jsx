import { useState } from "react";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";

const CONTACT_REASONS = [
  {
    icon: "🐛",
    title: "Report a bug",
    desc: "Something broken? Let us know what happened.",
  },
  {
    icon: "💡",
    title: "Feature request",
    desc: "Have an idea that would make ATSPro better?",
  },
  {
    icon: "💳",
    title: "Billing question",
    desc: "Questions about your plan or a charge.",
  },
  {
    icon: "🤝",
    title: "Partnership",
    desc: "Interested in collaborating or integrating?",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all fields", "error");
      return;
    }
    // No backend endpoint wired yet — this is a UI-complete form.
    // Replace with a real POST to /api/contact once the endpoint exists.
    setSent(true);
    showToast("Message sent! We'll get back to you soon.", "success");
  };

  return (
    <>
      <PublicNavbar />

      <section className="contact-hero">
        <span className="landing-eyebrow">Get in touch</span>
        <h1>We'd love to hear from you</h1>
        <p className="about-hero-sub">
          Questions, feedback, bug reports, or just want to say hi — drop us a
          message and we'll respond as soon as we can.
        </p>
      </section>

      <div className="contact-body">
        <div className="contact-reasons">
          {CONTACT_REASONS.map((r) => (
            <div key={r.title} className="contact-reason-card">
              <span className="contact-reason-icon">{r.icon}</span>
              <p className="contact-reason-title">{r.title}</p>
              <p className="contact-reason-desc">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="contact-form-card">
          {sent ? (
            <div className="contact-success">
              <div className="contact-success-icon">✓</div>
              <h3>Message sent</h3>
              <p>
                Thanks for reaching out — we typically respond within 1–2
                business days.
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", message: "" });
                }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">
                  <span className="material-symbols-outlined field-label-icon">
                    person
                  </span>
                  Your name
                </label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label">
                  <span className="material-symbols-outlined field-label-icon">
                    mail
                  </span>
                  Email address
                </label>
                <input
                  type="email"
                  className="modern-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label">
                  <span className="material-symbols-outlined field-label-icon">
                    chat
                  </span>
                  Message
                </label>
                <div className="modern-textarea-wrap">
                  <textarea
                    className="modern-textarea"
                    rows={6}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%" }}>
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
