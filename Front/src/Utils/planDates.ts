export function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function dayDate(month: string, day: number) {
  // Plan months may include "-01"; shift dates always use the YYYY-MM-DD form.
  return `${month.slice(0, 7)}-${String(day).padStart(2, "0")}`;
}

export function dayLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  // Parse calendar dates locally so a UTC conversion cannot move them to another day.
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function localDateTime(value: string | Date) {
  const date = new Date(value);
  const localTimestamp = date.getTime() - date.getTimezoneOffset() * 60_000;

  // datetime-local inputs expect local wall time without a timezone suffix.
  return new Date(localTimestamp).toISOString().slice(0, 16);
}

export function daysInMonth(month: string) {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));

  return new Date(year, monthNumber, 0).getDate();
}

export function generateCalendarMonth(year: number, monthNumber: number) {
  const monthIndex = monthNumber - 1;
  const firstDay = new Date(year, monthIndex, 1);
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  // JavaScript starts the week on Sunday; the calendar starts on Monday.
  const firstDayColumn = (firstDay.getDay() + 6) % 7;
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let column = 0; column < firstDayColumn; column++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
