import { useEffect, useState } from "react";

const ImmersiveBackground = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkShouldEnable = () => {
      if (typeof window === "undefined") return false;
      if (window.innerWidth < 1024) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      return true;
    };
    setIsEnabled(checkShouldEnable());
    const handleResize = () => setIsEnabled(checkShouldEnable());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Static subtle gradient fallback for mobile
  if (!isEnabled) {
    return (
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(252 100% 97%) 100%)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Animated gradient mesh - lavender tones, 25s loop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: "200% 200%",
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, hsl(263 68% 70% / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, hsl(252 100% 68% / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 60% 80%, hsl(280 60% 65% / 0.05) 0%, transparent 50%),
            linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(252 100% 97%) 100%)
          `,
          animation: "gradientShift 25s ease-in-out infinite",
        }}
      />

      {/* Floating Orb 1 - Large lavender, top-left */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{
          top: "-15%",
          left: "-10%",
          background: "radial-gradient(circle, hsl(263 68% 70% / 0.12) 0%, transparent 70%)",
          animation: "orbFloat1 25s ease-in-out infinite",
        }}
      />

      {/* Floating Orb 2 - Deep violet, bottom-right */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{
          bottom: "-10%",
          right: "-5%",
          background: "radial-gradient(circle, hsl(252 100% 68% / 0.1) 0%, transparent 70%)",
          animation: "orbFloat2 30s ease-in-out infinite",
        }}
      />

      {/* Floating Orb 3 - Soft purple, center-right */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
        style={{
          top: "30%",
          right: "15%",
          background: "radial-gradient(circle, hsl(280 60% 65% / 0.08) 0%, transparent 70%)",
          animation: "orbFloat3 22s ease-in-out infinite",
        }}
      />

      {/* Floating Orb 4 - Lavender glow, left-center */}
      <div
        className="absolute w-[250px] h-[250px] rounded-full blur-[70px]"
        style={{
          top: "50%",
          left: "5%",
          background: "radial-gradient(circle, hsl(252 100% 96% / 0.2) 0%, transparent 70%)",
          animation: "orbFloat2 28s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
};

export default ImmersiveBackground;
