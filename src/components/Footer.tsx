"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>
            &copy; {currentYear} Harish Govindasamy. All rights reserved.
          </span>
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>Built with care for productivity</span>
        </div>
      </div>
    </footer>
  );
}
