export type UnitType = "duration" | "currency" | "count" | "custom";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";
export type RecurrenceFreq = "daily" | "weekly" | "custom";
export type Difficulty = "easy" | "medium" | "hard";
export type CourseStatus = "completed" | "planned";

export interface GradeScaleItem {
  label: string;
  min: number;
  max: number;
  value: number; // e.g. 4.0, 3.5, etc.
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  timezone: string;
  gradeScale: {
    max: number;
    conversionTable: GradeScaleItem[];
  };
  preferences: {
    theme: "light" | "dark" | "system";
    weekStartsOn: 0 | 1;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrackerDTO {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  unitType: UnitType;
  unitLabel?: string;
  goal?: {
    period: "daily" | "weekly" | "monthly";
    targetValue: number;
  };
  order: number;
  isArchived: boolean;
  createdAt: string;
}

export interface TrackerEntryDTO {
  id: string;
  userId: string;
  trackerId: string;
  value: number;
  type?: "expense" | "income" | "default";
  category?: string;
  note?: string;
  date: string; // ISO date string (YYYY-MM-DD or ISO)
  createdAt: string;
}

export interface SubtaskDTO {
  title: string;
  done: boolean;
}

export interface TaskDTO {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // ISO string
  startTime?: string | null; // "HH:mm"
  endTime?: string | null; // "HH:mm"
  categoryId?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  color?: string;
  isRecurring: boolean;
  recurrenceRule?: {
    freq: RecurrenceFreq;
    daysOfWeek?: number[];
    until?: string;
  };
  templateId?: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  subtasks?: SubtaskDTO[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTemplateDTO {
  id: string;
  userId: string;
  name: string;
  tasks: Array<{
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    categoryId?: string;
    priority: TaskPriority;
    status: TaskStatus;
    color?: string;
    reminder?: {
      enabled: boolean;
      minutesBefore: number;
    };
    subtasks?: SubtaskDTO[];
    order: number;
  }>;
  createdAt: string;
}

export interface CategoryDTO {
  id: string;
  userId: string;
  name: string;
  color: string;
  type: "task" | "note" | "general";
}

export interface NoteDTO {
  id: string;
  userId: string;
  content: string; // HTML string or Tiptap JSON string
  images: string[];
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDTO {
  id: string;
  name: string;
  credits: number;
  grade?: number | null; // grade on scale, e.g. 4.0
  difficulty?: Difficulty;
  status: CourseStatus;
}

export interface SemesterDTO {
  id: string;
  userId: string;
  name: string;
  order: number;
  courses: CourseDTO[];
}

export interface AcademicGoalDTO {
  id: string;
  userId: string;
  targetGPA: number;
  totalCreditsRequired: number;
  updatedAt: string;
}

export interface JournalDTO {
  id: string;
  userId: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  content: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
}
