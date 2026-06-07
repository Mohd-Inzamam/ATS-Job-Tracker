import { useToast } from "../context/ToastContext";

const ICONS = {
  success: "check_circle",
  error: "error",
  info: "info",
  warning: "warning",
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="material-symbols-outlined toast-icon">
            {ICONS[toast.type]}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
