import { toKey, isToday } from './calendarUtils.js';

/**
 * The background box for one day: border, date number, click-to-add.
 *
 * Events are NOT rendered here — they live in the lane overlay in weekRow.jsx,
 * because a multi-day bar has to cross cell boundaries. This cell just reserves
 * the vertical space the overlay needs (`minHeight`).
 */
export default function CalendarCell({ day, minHeight, showWeekday = false, onAddEvent }) {
    const today = isToday(day.date);
    const dimmed = !day.inMonth;

    return (
        <div
            onClick={() => onAddEvent(toKey(day.date))}
            style={{ minHeight }}
            className={[
                'group relative cursor-pointer border border-border-dark p-2 transition-colors',
                dimmed ? 'bg-background/40 opacity-40' : 'bg-secondary/40 hover:bg-secondary',
            ].join(' ')}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                    {showWeekday && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            {day.date.toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                    )}
                    <span
                        className={[
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                            today ? 'bg-primary text-background' : 'text-gray-400',
                        ].join(' ')}
                    >
                        {day.date.getDate()}
                    </span>
                </div>

                <span className="text-lg leading-none text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
                    +
                </span>
            </div>
        </div>
    );
}
