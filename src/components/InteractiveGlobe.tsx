"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-104px)] flex flex-col items-center justify-center bg-black">
      <div className="w-12 h-12 border-2 border-t-accent rounded-full animate-spin mb-4" />
      <span className="text-white animate-pulse font-mono text-xs tracking-[0.3em]">ESTABLISHING SATELLITE LINK...</span>
    </div>
  )
});

interface NewsItem {
  id: string;
  title: string;
  country: string;
  lat: number;
  lng: number;
}

export default function InteractiveGlobe({ news }: { news: NewsItem[] }) {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight - 104 // Account for Top Bar
    });
    
    const onResize = () => setDimensions({
      width: window.innerWidth,
      height: window.innerHeight - 104
    });
    
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (globeRef.current && mounted) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.controls().enableZoom = true;
    }
  }, [mounted]);

  // Use useMemo to avoid re-rendering heavy parts just because state changes
  const points = useMemo(() => news, [news]);

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative group">
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none fade-in">
        <h2 className="text-xl font-mono text-white tracking-widest uppercase">Global Surveillance</h2>
        <p className="text-xs font-mono text-green-400 mt-1 max-w-sm">
          Tracking {points.length} active incidents dynamically mapped. 
          Use mouse to rotate and zoom.
        </p>
      </div>

      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Data points (red glowing dots)
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#ff3366"}
        pointAltitude={0.05}
        pointRadius={0.5}
        pointsMerge={false}
        
        // Hover labels
        labelsData={points}
        labelLat="lat"
        labelLng="lng"
        labelText="title"
        labelSize={1.2}
        labelDotRadius={1}
        labelColor={() => "white"}
        labelResolution={2}
        labelAltitude={0.1}
        
        // Rings for aesthetic pulse effect
        ringsData={points}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => "#ff3366"}
        ringMaxRadius={5}
        ringPropagationSpeed={3}
        ringRepeatPeriod={1500}
      />
    </div>
  );
}
