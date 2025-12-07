export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface Settings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  longBreakAfter: number;
  autoStartNextSession: boolean;
  autoStartBreak: boolean;
  notificationAdvanceTime: number;
  alarmSound: string;
  soundEnabled: boolean;
  notificationEnabled: boolean;
  theme: "light" | "dark" | "auto";
}

export interface DailyStats {
  date: string;
  pomodorosCompleted: number;
  totalFocusTimeMinutes: number;
  tasksCompleted: number;
}

export interface AppState {
  tasks: Task[];
  settings: Settings;
  today: DailyStats;
  history: DailyStats[];
}

export type TimerMode = "focus" | "shortBreak" | "longBreak";
export type TimerState = "idle" | "running" | "paused" | "completed";

export interface TimerData {
  currentTime: number;
  isRunning: boolean;
  mode: TimerMode;
  state: TimerState;
  pomodorosCompleted: number;
  selectedTaskId: string | null;
  lastCompletedMode: TimerMode | null;
}

export interface NotificationSettings {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export type AlarmSound =
  | "bell"
  | "beep"
  | "chime"
  | "ding"
  | "notification"
  | "pop"
  | "silence";

export interface TaskStats {
  total: number;
  completed: number;
  remaining: number;
  totalEstimated: number;
  totalCompleted: number;
}

export interface ImportExportData {
  tasks: Task[];
  settings: Settings;
  today: DailyStats;
  history: DailyStats[];
}
