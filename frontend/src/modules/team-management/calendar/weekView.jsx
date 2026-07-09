import WeekRow from './weekRow.jsx';
import { MAX_LANES } from './calendarConfig.js';
import { generateWeekDays } from './calendarUtils.js';

/**
 * A single week — the same row component and cell styling as the month view,
 * just taller and with room for more lanes before overflowing. Spanning events
 * cross the relevant day columns exactly as they do in a month row.
 */
export default function WeekView({ cursor, events, onAddEvent, onSelectEvent, onShowDay }) {
    const days = generateWeekDays(cursor);

    return (
        <div className="overflow-hidden rounded-xl border border-border-dark">
            <WeekRow
                days={days}
                events={events}
                maxLanes={MAX_LANES.week}
                minRows={6}
                showWeekday
                onAddEvent={onAddEvent}
                onSelectEvent={onSelectEvent}
                onShowDay={onShowDay}
            />
        </div>
    );
}
