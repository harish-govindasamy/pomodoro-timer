"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Quote as QuoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  text: string;
  author: string | null;
  category: string;
}

interface QuoteDisplayProps {
  category?: "focus" | "break" | "motivation" | "productivity";
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  showRefreshButton?: boolean;
  variant?: "default" | "compact" | "minimal";
}

export function QuoteDisplay({
  category,
  className,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  showRefreshButton = true,
  variant = "default",
}: QuoteDisplayProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQuote = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);

      const response = await fetch(`/api/quotes?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data.quote);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [category]);

  // Initial fetch
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchQuote, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchQuote]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchQuote();
  };

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  if (variant === "minimal") {
    return (
      <div className={cn("text-center", className)}>
        <p className="text-sm text-muted-foreground italic">"{quote.text}"</p>
        {quote.author && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            — {quote.author}
          </p>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <QuoteIcon className="h-4 w-4 text-primary/50 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {quote.text}
          </p>
          {quote.author && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              — {quote.author}
            </p>
          )}
        </div>
        {showRefreshButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-3 w-3", isRefreshing && "animate-spin")}
            />
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quote.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10",
          className,
        )}
      >
        {/* Decorative quote marks */}
        <QuoteIcon className="absolute top-4 left-4 h-8 w-8 text-primary/10" />
        <QuoteIcon className="absolute bottom-4 right-4 h-8 w-8 text-primary/10 rotate-180" />

        <div className="relative z-10 text-center px-6">
          <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed mb-4">
            "{quote.text}"
          </p>

          <div className="flex items-center justify-center gap-3">
            {quote.author && (
              <p className="text-sm text-muted-foreground">— {quote.author}</p>
            )}

            {showRefreshButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/10"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                />
                <span className="sr-only">New quote</span>
              </Button>
            )}
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium text-primary/60 bg-primary/5 px-2 py-1 rounded-full capitalize">
            {quote.category}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for using quotes programmatically
export function useQuote(category?: string) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);

      const response = await fetch(`/api/quotes?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data.quote);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return { quote, isLoading, refresh: fetchQuote };
}
