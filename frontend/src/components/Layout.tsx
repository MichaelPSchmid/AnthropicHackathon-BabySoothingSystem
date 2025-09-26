import React from "react";
import { Cloud, Heart, Moon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout = ({ children, className = "" }: LayoutProps) => {
  return (
    <div className={`min-h-screen night-sky ${className}`}>
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-100 via-pink-200 to-rose-200 bg-clip-text text-transparent tracking-wide">
                Somnii
              </h1>
              <Cloud className="w-6 h-6 text-white/60 absolute -top-2 -right-2 gentle-float" />
              <Cloud className="w-4 h-4 text-pink-100/50 absolute top-1/2 -left-4 gentle-float animate-delay-2" />
              <Cloud className="w-3 h-3 text-blue-100/40 absolute bottom-0 right-1/4 gentle-float animate-delay-1" />
            </div>
          </div>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8">
        <p className="text-muted-foreground text-sm">
          © Somnii 2025 — Peaceful parenting with AI
        </p>
      </footer>
    </div>
  );
};