import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import EventChip from './eventChip.jsx';
import { eventsOnDay } from './calendarLayout.js';
import { fromKey } from './calendarUtils.js';
import { creatorName } from './calendarConfig.js';

/**
 * What "+N more" opens: every event touching that day — spanning events
 * included, not just those starting on it. Picking one opens its detail.
 */
export default function DayEventsModal({ dayKey, events, onSelectEvent, onClose }) {
    const dayEvents = eventsOnDay(events, dayKey);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-panel max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border-dark p-5"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-main">
                        {fromKey(dayKey).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-500 transition-colors hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {dayEvents.map((event) => (
                        <div key={event._id} className="flex flex-col gap-0.5">
                            <EventChip event={event} onClick={onSelectEvent} />
                            <span className="pl-1.5 text-[10px] text-gray-600">
                                {creatorName(event)}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
