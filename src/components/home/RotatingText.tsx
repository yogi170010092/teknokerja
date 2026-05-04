import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const KEYS: TranslationKey[] = [
  "rotating.0",
  "rotating.1",
  "rotating.2",
  "rotating.3",
  "rotating.4",
];

const INTERVAL = 2500;

const RotatingText = () => {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const rotate = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % KEYS.length);
      setIsAnimating(false);
    }, 300);
  }, []);

  useEffect(() => {
    const id = setInterval(rotate, INTERVAL);
    return () => clearInterval(id);
  }, [rotate]);

  return (
    <span className="inline-block text-primary font-bold" style={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: "inherit" }}>
      <span
        className="inline-block transition-all duration-300 ease-out"
        style={{
          transform: isAnimating ? "translateY(110%)" : "translateY(0)",
          opacity: isAnimating ? 0 : 1,
          fontSize: "inherit",
          fontWeight: "inherit",
          lineHeight: "inherit",
        }}
      >
        {t(KEYS[index])}
      </span>
    </span>
  );
};

export default RotatingText;
