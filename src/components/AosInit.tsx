"use client";

import { useEffect } from "react";
import "aos/dist/aos.css";
import AOS from "aos";

export default function AosInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }

    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return null;
}
