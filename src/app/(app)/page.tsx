import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  Task,
  TaskPriority,
  TaskWithDomain,
  Routine,
  RoutineStep,
  RoutineCompletion,
  CalendarConnection,
} from "@/lib/types";
import { DOMAIN_COLOR_CLASSES } from "@/lib/colors";
import { APP_TIMEZONE, todayString, zonedStartOfDayUtc, zonedWeekday, formatDateDisplay } from "@/lib/date";
import { computeStreak, currentCycleDate } from "@/lib/routines";
import { describeRepeatRule } from "@/lib/recurrence";
import { isSlipping, daysSince, daysOverdue } from "@/lib/slipping";
import { toggleTaskStatus } from "@/app/(app)/tasks/actions";
import { StepCheckbox } from "@/app/(app)/routines/steps/step-checkbox";
import {
  refreshAccessToken,
  listCalendars,
  listEvents,
  type GoogleCalendarEvent,
} from "@/lib/google-calendar";

type CalendarEventWithColor = GoogleCalendarEvent & { calendarColor: string };

function formatEventTime(dateTime: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateTime));
}

function formatEventTimeRange(event: GoogleCalendarEvent): string {
  if (event.start.date) return "All day";
  const start = formatEventTime(event.start.dateTime!);
  return event.end.dateTime ? `${start} – ${formatEventTime(event.end.dateTime)}` : start;
}

function hasEnded(event: GoogleCalendarEvent): boolean {
  if (!event.end.dateTime) return false;
  return new Date(event.end.dateTime).getTime() < Date.now();
}

function isActiveNow(event: GoogleCalendarEvent): boolean {
  if (event.start.date) return true;
  if (!event.start.dateTime) return false;
  const start = new Date(event.start.dateTime).getTime();
  const end = event.end.dateTime ? new Date(event.end.dateTime).getTime() : start;
  const now = Date.now();
  return now >= start && now < end;
}

type TaskRow = Task & { domains: { name: string; color: TaskWithDomain["domain_color"] } | null };

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { high: 0, med: 1, low: 2 };

export default async function TodayPage() {
  const supabase = await createClient();
  const today = todayString();
  const todayWeekday = zonedWeekday();

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const { data: routinesData } = (await supabase
    .from("routines")
    .select("*")
    .order("sort_order")) as { data: Routine[] | null };
  const routines = routinesData ?? [];

  const { data: stepsData } =
    routines.length > 0
      ? ((await supabase
          .from("routine_steps")
          .select("*")
          .in(
            "routine_id",
            routines.map((r) => r.id)
          )
          .order("sort_order", { ascending: true })) as { data: RoutineStep[] | null })
      : { data: [] as RoutineStep[] };
  const steps = stepsData ?? [];

  const { data: completionsData } =
    steps.length > 0
      ? ((await supabase
          .from("routine_completions")
          .select("*")
          .in(
            "routine_step_id",
            steps.map((s) => s.id)
          )) as { data: RoutineCompletion[] | null })
      : { data: [] as RoutineCompletion[] };

  const completionsByStep = new Map<string, Set<string>>();
  for (const completion of completionsData ?? []) {
    const set = completionsByStep.get(completion.routine_step_id) ?? new Set();
    set.add(completion.cycle_date);
    completionsByStep.set(completion.routine_step_id, set);
  }

  const stepsByRoutine = new Map<string, RoutineStep[]>();
  for (const step of steps) {
    const list = stepsByRoutine.get(step.routine_id) ?? [];
    list.push(step);
    stepsByRoutine.set(step.routine_id, list);
  }

  const { data } = (await supabase
    .from("tasks")
    .select("*, domains(name, color)")
    .eq("status", "open")
    .or(`due_date.is.null,due_date.lte.${today}`)) as { data: TaskRow[] | null };

  const tasks = (data ?? [])
    .filter((t) => t.domains !== null)
    .map((t) => ({
      ...t,
      domain_name: t.domains!.name,
      domain_color: t.domains!.color,
    })) as TaskWithDomain[];

  tasks.sort((a, b) => {
    const aDue = a.due_date ?? "9999-12-31";
    const bDue = b.due_date ?? "9999-12-31";
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;
    if (a.priority !== b.priority) {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
  });

  const { data: slippingData } = (await supabase
    .from("tasks")
    .select("*, domains(name, color)")
    .eq("status", "open")) as { data: TaskRow[] | null };

  const slippingTasks = (slippingData ?? [])
    .filter((t) => t.domains !== null && isSlipping(t, today))
    .map((t) => ({
      ...t,
      domain_name: t.domains!.name,
      domain_color: t.domains!.color,
    })) as TaskWithDomain[];

  function slippingReasonText(task: TaskWithDomain): string {
    if (task.due_date && task.due_date < today) {
      const days = daysOverdue(task.due_date, today);
      return `${days} day${days === 1 ? "" : "s"} overdue`;
    }
    if (task.priority === "high") {
      return "Not completed the day it was created";
    }
    return `No update in ${daysSince(task.updated_at)} days`;
  }

  function slippingSortKey(task: TaskWithDomain): string {
    if (task.priority === "high") return task.due_date ?? task.created_at;
    return task.updated_at;
  }

  slippingTasks.sort((a, b) => {
    if (a.priority !== b.priority) {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    const aKey = slippingSortKey(a);
    const bKey = slippingSortKey(b);
    return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: calendarConnection } = (await supabase
    .from("calendar_connections")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .maybeSingle()) as { data: CalendarConnection | null };

  let calendarEvents: CalendarEventWithColor[] = [];
  if (calendarConnection) {
    let accessToken = calendarConnection.access_token;
    const expiryMs = calendarConnection.token_expiry
      ? new Date(calendarConnection.token_expiry).getTime()
      : 0;

    if (!accessToken || expiryMs < Date.now() + 60_000) {
      const refreshed = await refreshAccessToken(calendarConnection.refresh_token);
      accessToken = refreshed.accessToken;
      await supabase
        .from("calendar_connections")
        .update({ access_token: refreshed.accessToken, token_expiry: refreshed.expiresAt })
        .eq("user_id", calendarConnection.user_id);
    }

    const startOfDay = zonedStartOfDayUtc(today);
    const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    try {
      const calendars = await listCalendars(accessToken!);
      const eventsPerCalendar = await Promise.all(
        calendars.map(async (cal) => {
          const events = await listEvents(
            accessToken!,
            cal.id,
            startOfDay.toISOString(),
            startOfNextDay.toISOString()
          );
          return events.map((e) => ({
            ...e,
            calendarColor: cal.backgroundColor ?? "#8f887b",
          }));
        })
      );
      calendarEvents = eventsPerCalendar
        .flat()
        .filter((e) => !hasEnded(e))
        .sort((a, b) => {
          const aStart = a.start.dateTime ?? a.start.date ?? "";
          const bStart = b.start.dateTime ?? b.start.date ?? "";
          return aStart < bStart ? -1 : aStart > bStart ? 1 : 0;
        });
    } catch {
      calendarEvents = [];
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[30px] pt-9">
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Today
        </div>
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          {todayLabel}
        </h1>
      </div>

      {slippingTasks.length > 0 && (
        <div className="mb-[38px]">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slipping-label">
            Slipping
          </div>
          <div className="flex flex-col gap-2.5">
            {slippingTasks.map((task) => (
              <Link
                key={task.id}
                href={`/domains/${task.domain_id}/tasks/${task.id}`}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-slipping-border bg-slipping-fill px-[15px] py-[13px]"
              >
                <div className="flex items-start gap-[11px]">
                  <span
                    className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${DOMAIN_COLOR_CLASSES[task.domain_color]}`}
                  />
                  <div>
                    <div className="mb-[3px] text-[15px] text-foreground">{task.title}</div>
                    <div className="text-[12px] text-muted">
                      {task.domain_name} · {slippingReasonText(task)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {calendarEvents.length > 0 && (
        <div className="mb-[38px]">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Calendar
          </div>
          <div className="border-t border-hairline">
            {calendarEvents.map((event) => {
              const active = isActiveNow(event);
              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-3.5 border-b border-hairline py-3.5 ${
                    active ? "-mx-2.5 rounded-lg bg-white/[.04] px-2.5" : ""
                  }`}
                >
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: event.calendarColor }}
                  />
                  <span
                    className={`flex-1 text-[15px] ${
                      active ? "font-medium text-accent" : "text-foreground"
                    }`}
                  >
                    {event.summary || "(No title)"}
                  </span>
                  {active && (
                    <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                      Now
                    </span>
                  )}
                  <span className="whitespace-nowrap text-[12.5px] tabular-nums text-muted">
                    {formatEventTimeRange(event)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {routines.map((routine) => {
        const visibleSteps = (stepsByRoutine.get(routine.id) ?? []).filter(
          (step) => !step.only_show_on_weekday || step.weekday === todayWeekday
        );
        if (visibleSteps.length === 0) return null;

        return (
          <div key={routine.id} className="mb-[38px]">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              {routine.name}
            </div>
            <div className="border-t border-hairline">
              {visibleSteps.map((step) => {
                const completions = completionsByStep.get(step.id) ?? new Set<string>();
                const cycleDate = currentCycleDate(routine.cadence, step.weekday);
                const checked = completions.has(cycleDate);
                const streak = computeStreak(routine.cadence, step.weekday, completions);
                return (
                  <StepCheckbox
                    key={step.id}
                    routineId={routine.id}
                    stepId={step.id}
                    cadence={routine.cadence}
                    weekday={step.weekday}
                    label={step.label}
                    checked={checked}
                    streak={streak}
                    allowUncheck={false}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mb-2">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Tasks
        </div>
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => {
            const overdue = task.due_date !== null && task.due_date < today;
            return (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-card-border px-[15px] py-3.5"
              >
                <div className="flex items-start gap-[11px]">
                  <span
                    className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${DOMAIN_COLOR_CLASSES[task.domain_color]}`}
                  />
                  <div>
                    <div className="mb-[3px] text-[15px] text-foreground">{task.title}</div>
                    <div className="text-[12px] leading-[1.4] text-muted">
                      {task.domain_name} ·{" "}
                      {task.due_date
                        ? overdue
                          ? `Overdue (${formatDateDisplay(task.due_date)})`
                          : `Due ${formatDateDisplay(task.due_date)}`
                        : "No due date"}{" "}
                      · {task.priority}
                      {task.repeat_unit &&
                        ` · ${describeRepeatRule({
                          unit: task.repeat_unit,
                          interval: task.repeat_interval,
                          weekdays: task.repeat_weekdays,
                        })}`}
                    </div>
                  </div>
                </div>
                <form action={toggleTaskStatus.bind(null, task.domain_id, task.id)}>
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
                  >
                    Done
                  </button>
                </form>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <p className="my-1 text-[14px] text-muted">Nothing due right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
