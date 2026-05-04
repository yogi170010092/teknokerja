import { useEffect, useState, useRef, RefObject } from "react";

interface ScrollZoomOptions {
  minScale?: number;
  maxScale?: number;
  translateY?: number;
  opacityStart?: number;
  opacityEnd?: number;
}

interface ScrollZoomStyles {
  transform: string;
  opacity: number;
  willChange: string;
}

/**
 * GPU-accelerated scroll zoom effect
 * Uses translate3d for hardware acceleration without causing blur
 */
export const useScrollZoom = (
  ref: RefObject<HTMLElement>,
  options: ScrollZoomOptions = {}
): ScrollZoomStyles => {
  const {
    minScale = 1,
    maxScale = 1.06,
    translateY = -15,
    opacityStart = 1,
    opacityEnd = 0.9,
  } = options;

  const [styles, setStyles] = useState<ScrollZoomStyles>({
    transform: `scale3d(${minScale}, ${minScale}, 1) translate3d(0, 0, 0)`,
    opacity: opacityStart,
    willChange: "transform, opacity",
  });

  const isEnabledRef = useRef(true);
  const rafRef = useRef<number>();

  useEffect(() => {
    // Check if should enable
    const checkShouldEnable = () => {
      if (typeof window === "undefined") return false;
      // Disable on mobile
      if (window.innerWidth < 1024) return false;
      // Respect reduced motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      return true;
    };

    isEnabledRef.current = checkShouldEnable();

    if (!isEnabledRef.current) {
      setStyles({
        transform: "none",
        opacity: 1,
        willChange: "auto",
      });
      return;
    }

    const handleScroll = () => {
      if (!ref.current || !isEnabledRef.current) return;

      // Cancel any pending frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const element = ref.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate scroll progress (0 when element enters viewport, 1 when it leaves)
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Progress from 0 (element at bottom of viewport) to 1 (element scrolled past top)
        const progress = Math.max(0, Math.min(1, 
          (viewportHeight - elementTop) / (viewportHeight + elementHeight)
        ));

        // Apply easing
        const easedProgress = progress * progress;

        // Calculate values
        const scale = minScale + (maxScale - minScale) * easedProgress;
        const yOffset = translateY * easedProgress;
        const opacity = opacityStart + (opacityEnd - opacityStart) * easedProgress;

        setStyles({
          transform: `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1) translate3d(0, ${yOffset.toFixed(2)}px, 0)`,
          opacity: Math.max(opacityEnd, opacity),
          willChange: "transform, opacity",
        });
      });
    };

    // Initial calculation
    handleScroll();

    // Use passive listener for performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      isEnabledRef.current = checkShouldEnable();
      if (!isEnabledRef.current) {
        setStyles({
          transform: "none",
          opacity: 1,
          willChange: "auto",
        });
      } else {
        handleScroll();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [ref, minScale, maxScale, translateY, opacityStart, opacityEnd]);

  return styles;
};

export default useScrollZoom;
