/**
 * Date helpers for the calendar grid. Weeks are Monday-first.
 *
 * Every day is identified by a local "YYYY-MM-DD" key — the same value the
 * backend stores — so events map straight onto cells with no conversion.
 * Note we build the key from local getters, not toISOString(), which converts
 * to UTC and can land an event on the previous/next day.
 */

const pad = (n) => String(n).padStart(2, '0');

/** Date -> "YYYY-MM-DD" in local time. */
export const toKey = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

export const addMonths = (date, months) => {
    // Anchor to the 1st first: Jan 31 + 1 month would otherwise roll to Mar 3.
    const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
    return next;
};

export const isSameDay = (a, b) => toKey(a) === toKey(b);

export const isToday = (date) => isSameDay(date, new Date());

/** Monday of the week containing `date`. */
export const startOfWeek = (date) => {
    const day = date.getDay(); // 0 = Sun
    const offset = day === 0 ? -6 : 1 - day;
    return addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), offset);
};

/** The 7 days of `date`'s week. */
export const generateWeekDays = (date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => ({
        date: addDays(start, i),
        inMonth: true,
    }));
};

/**
 * Whole weeks covering `date`'s month, padded with leading/trailing days from
 * the neighbouring months so the result is always a clean multiple of 7.
 */
export const generateMonthDays = (date) => {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const start = startOfWeek(firstOfMonth);
    const end = startOfWeek(lastOfMonth);

    const days = [];
    for (let cursor = start; cursor <= addDays(end, 6); cursor = addDays(cursor, 1)) {
        days.push({
            date: new Date(cursor),
            inMonth: cursor.getMonth() === date.getMonth(),
        });
    }
    return days;
};

/** Inclusive { from, to } keys for a day list — what the list endpoint wants. */
export const rangeOf = (days) => ({
    from: toKey(days[0].date),
    to: toKey(days[days.length - 1].date),
});

/** "YYYY-MM-DD" -> local Date (the inverse of toKey). */
export const fromKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
};

/** Human date range: one day collapses to a single date. */
export const formatKeyRange = (startKey, endKey) => {
    const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const start = fromKey(startKey).toLocaleDateString(undefined, opts);
    if (!endKey || endKey === startKey) return start;
    return `${start} – ${fromKey(endKey).toLocaleDateString(undefined, opts)}`;
};

export const monthLabel = (date) =>
    date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export const weekLabel = (date) => {
    const start = startOfWeek(date);
    const end = addDays(start, 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const opts = { month: 'short', day: 'numeric' };
    const left = start.toLocaleDateString(undefined, opts);
    const right = end.toLocaleDateString(
        undefined,
        sameMonth ? { day: 'numeric' } : opts,
    );
    return `${left} – ${right}, ${end.getFullYear()}`;
};
