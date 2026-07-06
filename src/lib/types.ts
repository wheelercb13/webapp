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

export type RoutineCadence = "daily" | "weekly";

export type Routine = {
  id: string;
  user_id: string;
  name: string;
  cadence: RoutineCadence;
  created_at: string;
};

export type RoutineStep = {
  id: string;
  user_id: string;
  routine_id: string;
  label: string;
  sort_order: number;
  created_at: string;
};

export type RoutineCompletion = {
  id: string;
  user_id: string;
  routine_step_id: string;
  cycle_date: string;
  completed_at: string;
};

export type InboxResolution = "task" | "idea" | "note";

export type InboxItem = {
  id: string;
  user_id: string;
  raw_text: string;
  captured_at: string;
  resolved: boolean;
  resolved_into: InboxResolution | null;
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
