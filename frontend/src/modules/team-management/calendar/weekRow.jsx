import CalendarCell from './calendarCell.jsx';
import EventChip from './eventChip.jsx';
import { layoutWeek } from './calendarLayout.js';
import { LANE_HEIGHT, CELL_HEADER_HEIGHT } from './calendarConfig.js';
import { toKey } from './calendarUtils.js';

/**
 * A single 7-day row, shared by the month view (one per week) and the week view
 * (exactly one). Two layers:
 *
 *   1. background cells — borders, date numbers, click-to-add
 *   2. an absolutely-positioned `grid-cols-7` overlay holding the event bars,
 *      each placed with `gridColumn: start / span n` and `gridRow: lane`
 *
 * The overlay is pointer-events-none so clicks fall through to the cell beneath;
 * only the chips themselves re-enable pointer events.
 */
export default function WeekRow({
    days,
    events,
    maxLanes,
    minRows = 0,
    showWeekday = false,
    onAddEvent,
    onSelectEvent,
    onShowDay,
}) {
    const { segments, chips, visibleLanes, rows } = layoutWeek(days, events, maxLanes);

    const laneRows = Math.max(rows, minRows);
    const minHeight = CELL_HEADER_HEIGHT + laneRows * LANE_HEIGHT + 8;

    return (
        <div className="relative">
            <div className="grid grid-cols-7">
                {days.map((day) => (
                    <CalendarCell
                        key={toKey(day.date)}
                        day={day}
                        minHeight={minHeight}
                        showWeekday={showWeekday}
                        onAddEvent={onAddEvent}
                    />
                ))}
            </div>

            <div
                className="pointer-events-none absolute inset-x-0 grid grid-cols-7 gap-y-0.5"
                style={{
                    top: CELL_HEADER_HEIGHT,
                    gridAutoRows: `${LANE_HEIGHT}px`,
                }}
            >
                {segments.map((segment) => (
                    <div
                        key={segment.event._id}
                        className="pointer-events-auto min-w-0 px-1"
                        style={{
                            gridColumn: `${segment.startIdx + 1} / span ${
                                segment.endIdx - segment.startIdx + 1
                            }`,
                            gridRow: segment.lane + 1,
                        }}
                    >
                        <EventChip
                            event={segment.event}
                            continuesLeft={segment.continuesLeft}
                            continuesRight={segment.continuesRight}
                            onClick={onSelectEvent}
                        />
                    </div>
                ))}

                {chips.map((chip) => (
                    <div
                        key={chip.key}
                        className="pointer-events-auto min-w-0 px-1"
                        style={{
                            gridColumn: `${chip.dayIdx + 1} / span 1`,
                            gridRow: visibleLanes + 1,
                        }}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowDay(chip.key);
                            }}
                            className="h-[18px] w-full rounded px-1.5 text-left text-[11px] font-semibold text-gray-400 transition-colors hover:bg-secondary hover:text-primary"
                        >
                            +{chip.count} more
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
