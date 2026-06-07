import { createContext, useCallback, useContext, useEffect, useState } from "react";
import UpgradeModal from "../components/UpgradeModal";

const UpgradeModalContext = createContext();

export function UpgradeModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState("");
  const [message, setMessage] = useState("");

  const showUpgradeModal = useCallback((feat, msg) => {
    setFeature(feat);
    setMessage(msg);
    setIsOpen(true);
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      showUpgradeModal(e.detail.feature, e.detail.message);
    };
    window.addEventListener("upgradeRequired", handler);
    return () => window.removeEventListener("upgradeRequired", handler);
  }, [showUpgradeModal]);

  return (
    <UpgradeModalContext.Provider
      value={{ isOpen, feature, message, showUpgradeModal, hideUpgradeModal }}
    >
      {children}
      <UpgradeModal
        isOpen={isOpen}
        onClose={hideUpgradeModal}
        feature={feature}
        message={message}
      />
    </UpgradeModalContext.Provider>
  );
}

export const useUpgradeModal = () => useContext(UpgradeModalContext);
