import type { RepeatUnit } from "./recurrence";

export type DomainColor =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"
  | "gray";

export const DOMAIN_COLORS: DomainColor[] = [
  "red",
  "orange",
  "amber",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
  "gray",
];

export type Domain = {
  id: string;
  user_id: string;
  name: string;
  color: DomainColor;
  sort_order: number;
  created_at: string;
};

export type TaskPriority = "low" | "med" | "high";
export type TaskStatus = "open" | "done";
export type TaskSource = "voice" | "typed" | "calendar";

export type Task = {
  id: string;
  user_id: string;
  domain_id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  source: TaskSource;
  sort_order: number;
  created_at: string;
  updated_at: string;
  repeat_unit: RepeatUnit | null;
  repeat_interval: number;
  repeat_weekdays: number[] | null;
  repeat_until: string | null;
};

export type TaskWithDomain = Task & {
  domain_name: Domain["name"];
  domain_color: Domain["color"];
};

export type FunctionAccessLevel = "general" | "admin";

export type FunctionAccess = {
  key: string;
  label: string;
  access_level: FunctionAccessLevel;
  updated_at: string;
};

export type PageVisibility = {
  user_id: string;
  page_key: string;
  visible: boolean;
  updated_at: string;
};

export type RoutineCadence = "daily" | "weekly";

export type Routine = {
  id: string;
  user_id: string;
  name: string;
  cadence: RoutineCadence;
  sort_order: number;
  created_at: string;
};

export type RoutineStep = {
  id: string;
  user_id: string;
  routine_id: string;
  label: string;
  sort_order: number;
  weekdays: number[] | null;
  created_at: string;
};

export type RoutineCompletion = {
  id: string;
  user_id: string;
  routine_step_id: string;
  cycle_date: string;
  completed_at: string;
};

export type RoutineHistory = {
  id: string;
  user_id: string;
  source_routine_id: string | null;
  name: string;
  cadence: RoutineCadence;
  created_at: string;
  deleted_at: string | null;
};

export type RoutineStepHistory = {
  id: string;
  user_id: string;
  routine_history_id: string;
  source_step_id: string | null;
  step_label: string;
  longest_streak_days: number;
  streak_start_cycle_date: string | null;
  streak_end_cycle_date: string | null;
  completion_count: number;
  updated_at: string;
};

export type InboxResolution = "task" | "idea" | "note";

export type InboxItem = {
  id: string;
  user_id: string;
  raw_text: string;
  captured_at: string;
  resolved: boolean;
  resolved_into: InboxResolution | null;
  resolved_at: string | null;
};

export type IdeaStage = "idea" | "drafting" | "published";

export type Idea = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  tags: string[];
  stage: IdeaStage;
  priority: TaskPriority;
  linked_task_id: string | null;
  created_at: string;
};

export type NoteSource = "manual" | "voice";

export type Note = {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  source: NoteSource;
  created_at: string;
};

export type CalendarConnection = {
  id: string;
  user_id: string;
  refresh_token: string;
  access_token: string | null;
  token_expiry: string | null;
  created_at: string;
};
