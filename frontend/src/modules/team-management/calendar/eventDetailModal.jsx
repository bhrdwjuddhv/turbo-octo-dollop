import { motion } from 'framer-motion';
import { X, Clock, CalendarDays, User, Pencil, Trash2 } from 'lucide-react';
import { resolveEventStyle, creatorName } from './calendarConfig.js';
import { eventEnd } from './calendarLayout.js';
import { formatKeyRange } from './calendarUtils.js';

/** Read-only detail popover for a single event, with edit/delete affordances. */
export default function EventDetailModal({ event, onEdit, onDelete, onClose }) {
    const { label, hex } = resolveEventStyle(event);

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
                className="glass-panel w-full max-w-md rounded-2xl border border-border-dark p-6"
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span
                            className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: hex }}
                        />
                        <div>
                            <h3 className="text-lg font-bold leading-tight text-text-main">
                                {event.title}
                            </h3>
                            <span
                                className="mt-1 inline-block rounded border px-1.5 py-0.5 text-[11px] font-semibold"
                                style={{
                                    color: hex,
                                    borderColor: `${hex}66`,
                                    backgroundColor: `${hex}1a`,
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-500 transition-colors hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <dl className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-300">
                        <CalendarDays className="h-4 w-4 shrink-0 text-gray-500" />
                        {formatKeyRange(event.date, eventEnd(event))}
                    </div>

                    {event.time && (
                        <div className="flex items-center gap-3 text-gray-300">
                            <Clock className="h-4 w-4 shrink-0 text-gray-500" />
                            {event.time}
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-300">
                        <User className="h-4 w-4 shrink-0 text-gray-500" />
                        Added by{' '}
                        <span className="font-semibold text-text-main">
                            {creatorName(event)}
                        </span>
                    </div>

                    {event.description && (
                        <p className="whitespace-pre-wrap rounded-lg border border-border-dark bg-background/60 p-3 text-sm text-gray-400">
                            {event.description}
                        </p>
                    )}
                </dl>

                <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onDelete(event)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(event)}
                        className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-background"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
