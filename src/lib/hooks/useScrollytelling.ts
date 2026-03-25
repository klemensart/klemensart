"use client";

import { useState, useRef, useCallback } from "react";
import type { Route } from "@/lib/harita-data";

export function useScrollytelling() {
  const [scrollyActive, setScrollyActive] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollyRoute, setScrollyRoute] = useState<Route | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapboxMapRef = useRef<any>(null);
  const mapboxContainerRef = useRef<HTMLDivElement | null>(null);

  const enterScrollytelling = useCallback(async (route: Route) => {
    setScrollyRoute(route);
    setCurrentChapter(0);
    setScrollProgress(0);
    setScrollyActive(true);
  }, []);

  const exitScrollytelling = useCallback(() => {
    // Cleanup mapbox
    if (mapboxMapRef.current) {
      mapboxMapRef.current.remove();
      mapboxMapRef.current = null;
    }
    setScrollyActive(false);
    setScrollyRoute(null);
    setCurrentChapter(0);
    setScrollProgress(0);
  }, []);

  return {
    scrollyActive,
    currentChapter,
    setCurrentChapter,
    scrollProgress,
    setScrollProgress,
    scrollyRoute,
    enterScrollytelling,
    exitScrollytelling,
    mapboxMapRef,
    mapboxContainerRef,
  };
}
