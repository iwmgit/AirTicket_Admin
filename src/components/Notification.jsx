import { useEffect } from "react";

export default function Notification({ type = "success", message = "", onClose = () => {} }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: "✓",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "✕",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: "⚠",
    },
  };

  const style = styles[type] || styles.success;

  return (
    <div className={`fixed top-4 right-4 ${style.bg} border ${style.border} ${style.text} px-4 py-3 rounded-lg flex items-center gap-3 z-40 shadow-lg`}>
      <span className="font-bold text-lg">{style.icon}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className={`ml-2 font-bold ${style.text} hover:opacity-70 transition`}
      >
        ×
      </button>
    </div>
  );
}
