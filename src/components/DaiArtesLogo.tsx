import React from "react";
import { cn } from "@/lib/utils";

interface DaiArtesLogoProps {
  className?: string;
  showText?: boolean;
}

/**
 * Standard Logo Component for Dai Artes
 * Uses the static production-safe asset path.
 */
export function DaiArtesLogo({ className, showText = false }: DaiArtesLogoProps) {
  const logoPath = "/images/logo-dai-artes.png";
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={logoPath} 
        alt="Dai Artes Logo" 
        className="h-full w-full object-contain pointer-events-none"
        loading="eager"
        decoding="async"
      />
      {showText && (
        <span className="font-semibold tracking-tight">DAI ARTES</span>
      )}
    </div>
  );
}
