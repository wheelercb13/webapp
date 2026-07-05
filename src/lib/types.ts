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
