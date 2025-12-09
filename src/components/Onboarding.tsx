"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Timer,
  ListTodo,
  BarChart3,
  Settings,
  Target,
  Coffee,
  Moon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Keyboard,
  Bell,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features?: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to Pomofocus",
    description:
      "Boost your productivity with the Pomodoro Technique. Work in focused intervals, take breaks, and accomplish more.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    features: [
      "25-minute focus sessions",
      "Short and long breaks",
      "Track your progress",
    ],
  },
  {
    id: 2,
    title: "Focus Timer",
    description:
      "Start a focus session and stay concentrated. The timer helps you work in productive bursts.",
    icon: Timer,
    color: "from-red-500 to-orange-500",
    features: [
      "Focus: 25 minutes of deep work",
      "Short Break: 5 minutes to recharge",
      "Long Break: 15 minutes after 4 sessions",
    ],
  },
  {
    id: 3,
    title: "Manage Your Tasks",
    description:
      "Create tasks, estimate pomodoros needed, and track completion. Select a task to link it with your timer.",
    icon: ListTodo,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Add tasks with estimated pomodoros",
      "Track completed pomodoros per task",
      "Mark tasks as complete",
    ],
  },
  {
    id: 4,
    title: "Track Your Progress",
    description:
      "View your productivity statistics. See daily, weekly, and monthly trends to stay motivated.",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
    features: [
      "Daily session count",
      "Total focus time",
      "Historical trends",
    ],
  },
  {
    id: 5,
    title: "Customize Your Experience",
    description:
      "Personalize timer durations, sounds, notifications, and theme to match your workflow.",
    icon: Settings,
    color: "from-gray-500 to-slate-600",
    features: [
      "Adjustable timer durations",
      "Sound and notification settings",
      "Light/Dark theme",
    ],
  },
  {
    id: 6,
    title: "Pro Tips",
    description:
      "Get the most out of Pomofocus with these helpful tips and keyboard shortcuts.",
    icon: Keyboard,
    color: "from-amber-500 to-yellow-500",
    features: [
      "Space: Play/Pause timer",
      "R: Reset timer",
      "S: Skip to next session",
    ],
  },
];

const STORAGE_KEY = "pomofocus_onboarding_completed";

interface OnboardingProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function Onboarding({ onComplete, forceShow = false }: OnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if onboarding was already completed
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed || forceShow) {
        setIsVisible(true);
      }
    }
  }, [forceShow]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;

    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep, isAnimating]);

  const handlePrevious = useCallback(() => {
    if (isAnimating) return;

    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep, isAnimating]);

  const handleComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep === onboardingSteps.length - 1) {
          handleComplete();
        } else {
          handleNext();
        }
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStep, handleNext, handlePrevious, handleComplete, handleSkip]);

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <Card
        className={cn(
          "w-full max-w-lg overflow-hidden transition-all duration-300",
          isAnimating && "opacity-0 scale-95"
        )}
      >
        {/* Header with gradient */}
        <div
          className={cn(
            "relative h-48 flex items-center justify-center bg-gradient-to-br",
            step.color
          )}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-white/20" />
            <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/5" />
          </div>

          {/* Icon */}
          <div className="relative z-10 w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <StepIcon className="w-12 h-12 text-white" />
          </div>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-sm font-medium transition-colors"
            aria-label="Skip onboarding"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <h2
              id="onboarding-title"
              className="text-2xl font-bold text-foreground"
            >
              {step.title}
            </h2>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          {/* Features list */}
          {step.features && (
            <ul className="space-y-2 pt-2">
              {step.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br text-white",
                      step.color
                    )}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-4">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentStep(index);
                      setIsAnimating(false);
                    }, 150);
                  }
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentStep
                    ? "w-6 bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to step ${index + 1}`}
                aria-current={index === currentStep ? "step" : undefined}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              onClick={isLastStep ? handleComplete : handleNext}
              className={cn(
                "flex-1 bg-gradient-to-r text-white border-0",
                step.color
              )}
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-muted-foreground">
            Use arrow keys to navigate • Press Esc to skip
          </p>
        </div>
      </Card>
    </div>
  );
}

// Hook to check if onboarding should be shown
export function useOnboarding() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(STORAGE_KEY);
      setShouldShow(!completed);
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setShouldShow(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
      setShouldShow(false);
    }
  }, []);

  return {
    shouldShow,
    resetOnboarding,
    completeOnboarding,
  };
}

// Export storage key for external use
export { STORAGE_KEY as ONBOARDING_STORAGE_KEY };
