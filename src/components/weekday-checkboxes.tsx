export const WEEKDAYS = [
  { value: 0, label: "Sunday", short: "S" },
  { value: 1, label: "Monday", short: "M" },
  { value: 2, label: "Tuesday", short: "T" },
  { value: 3, label: "Wednesday", short: "W" },
  { value: 4, label: "Thursday", short: "T" },
  { value: 5, label: "Friday", short: "F" },
  { value: 6, label: "Saturday", short: "S" },
];

export function WeekdayCheckboxes({
  name,
  defaultValues,
}: {
  name: string;
  defaultValues: number[];
}) {
  return (
    <div className="flex gap-1.5">
      {WEEKDAYS.map((day) => (
        <label key={day.value} className="cursor-pointer" title={day.label}>
          <input
            type="checkbox"
            name={name}
            value={day.value}
            defaultChecked={defaultValues.includes(day.value)}
            className="peer sr-only"
          />
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-button-border text-[11px] font-semibold text-foreground transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-background">
            {day.short}
          </span>
        </label>
      ))}
    </div>
  );
}
