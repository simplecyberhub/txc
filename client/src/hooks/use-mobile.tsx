import { useState, useEffect } from "react";

/**
 * Hook to check if the current device is mobile
 * @param breakpoint The width threshold for mobile devices (default: 768px)
 * @returns Object with isMobile boolean and width state
 */
export function useMobile(breakpoint: number = 768) {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWidth(window.innerWidth);
      setIsMobile(window.innerWidth < breakpoint);
    }
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]); // Re-run if breakpoint changes

  return { isMobile, width };
}