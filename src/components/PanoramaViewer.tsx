"use client";
import React, { useEffect, useRef } from "react";
import "@/lib/pannellum/css/pannellum.css";

export interface PanoramaViewerProps {
  imagePath: string;
  width?: string;
  height?: string;
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  imagePath,
  width = "100%",
  height = "100%",
}) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pannellumViewerRef = useRef<any>(null);

  // Load scripts only once
  useEffect(() => {
    if ((window as any).pannellum) return; // already loaded

    const script1 = document.createElement("script");
    script1.src = "/pannellum/libpannellum.js";
    script1.async = true;

    const script2 = document.createElement("script");
    script2.src = "/pannellum/pannellum.js";
    script2.async = true;

    document.body.appendChild(script1);
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  // Initialize viewer or update panorama when imagePath changes
  useEffect(() => {
    if (!viewerRef.current || !(window as any).pannellum) return;

    // Destroy previous viewer if exists
    if (pannellumViewerRef.current) {
      pannellumViewerRef.current.destroy();
      pannellumViewerRef.current = null;
    }

    // Initialize new viewer
    pannellumViewerRef.current = (window as any).pannellum.viewer(
      viewerRef.current,
      {
        type: "equirectangular",
        panorama: imagePath,
        autoLoad: true,
        showControls: false,
      }
    );
  }, [imagePath]);

  return <div ref={viewerRef} style={{ width, height }} />;
};

export default PanoramaViewer;
