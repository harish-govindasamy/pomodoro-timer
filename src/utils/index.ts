import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatTimeDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatMinutesToHHMM(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function playSound(soundType: string): void {
  try {
    if (typeof window === "undefined") return;

    // Use Web Audio API to generate sounds since we may not have mp3 files
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different sounds
    const frequencies: Record<string, number> = {
      bell: 830,
      chime: 659,
      digital: 440,
      gentle: 523,
      alarm: 880,
    };

    oscillator.frequency.value = frequencies[soundType] || 660;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.8
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  } catch (error) {
    console.warn("Failed to play sound:", error);
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied");
  }

  return Notification.requestPermission();
}

export function showNotification(
  title: string,
  body: string,
  icon?: string
): void {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      tag: "pomofocus",
    });
  }
}

export function updateBrowserTitle(time: number, mode: string): void {
  if (typeof window === "undefined") return;

  const timeString = formatTime(time);
  const modeEmoji =
    mode === "focus" ? "🍅" : mode === "shortBreak" ? "☕" : "🌴";
  document.title = `${timeString} - ${modeEmoji} Pomofocus`;
}

export function resetBrowserTitle(): void {
  if (typeof window === "undefined") return;

  document.title = "Pomofocus - Pomodoro Timer";
}

export function validateTaskTitle(title: string): boolean {
  return title.trim().length > 0 && title.length <= 100;
}

export function validatePomodoroCount(count: number): boolean {
  return Number.isInteger(count) && count >= 1 && count <= 10;
}

export function calculateEstimatedTime(
  pomodoros: number,
  focusTime: number
): number {
  if (pomodoros <= 0 || focusTime <= 0) return 0;

  // Calculate total focus time
  let totalMinutes = pomodoros * focusTime;

  // Add break times between pomodoros
  // For every pomodoro after the first, add a 5 minute break
  // Every 4th pomodoro is followed by a 15 minute break
  if (pomodoros > 1) {
    // Count short breaks and long breaks
    let shortBreaks = pomodoros - 1; // At least one break per pomodoro transition
    let longBreaks = Math.floor(pomodoros / 4); // Every 4th pomodoro gets a long break

    // Adjust short breaks to exclude long breaks
    shortBreaks = shortBreaks - longBreaks;

    totalMinutes += shortBreaks * 5; // 5 minutes for short breaks
    totalMinutes += longBreaks * 15; // 15 minutes for long breaks
  }

  return totalMinutes;
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  const progress = (completed / total) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
