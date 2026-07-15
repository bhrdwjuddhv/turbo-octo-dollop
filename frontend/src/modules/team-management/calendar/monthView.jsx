import WeekRow from './weekRow.jsx';
import { WEEKDAYS, MAX_LANES } from './calendarConfig.js';
import { generateMonthDays, toKey } from './calendarUtils.js';

/**
 * 7-column month grid, laid out one week row at a time. Spanning events are
 * computed per row, so an event crossing a week boundary breaks into a fresh
 * bar segment on the next row instead of being drawn once in its start cell.
 */
export default function MonthView({
    cursor,
    events,
    onAddEvent,
    onSelectEvent,
    onShowDay,
    meetingCtx,
}) {
    const days = generateMonthDays(cursor);

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border-dark">
            <div className="grid grid-cols-7">
                {WEEKDAYS.map((label) => (
                    <div
                        key={label}
                        className="border-b border-border-dark bg-background/60 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {weeks.map((week) => (
                <WeekRow
                    key={toKey(week[0].date)}
                    days={week}
                    events={events}
                    maxLanes={MAX_LANES.month}
                    onAddEvent={onAddEvent}
                    onSelectEvent={onSelectEvent}
                    onShowDay={onShowDay}
                    meetingCtx={meetingCtx}
                />
            ))}
        </div>
    );
}
