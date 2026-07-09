import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import {
    EVENT_TYPES,
    DEFAULT_TYPE,
    CUSTOM_TYPE,
    CUSTOM_COLORS,
} from './calendarConfig.js';

/**
 * One modal for create + edit + delete. `event` carries an `_id` when editing;
 * a bare `{ date }` when creating on an empty cell.
 *
 * End date is optional: blank (or equal to the start) means a single-day event.
 */
export default function EventModal({ event, onSave, onDelete, onClose, saving }) {
    const isEdit = Boolean(event?._id);

    const [form, setForm] = useState({
        title: event?.title ?? '',
        date: event?.date ?? '',
        // Don't surface a redundant end date for single-day events.
        endDate: event?.endDate && event.endDate !== event.date ? event.endDate : '',
        time: event?.time ?? '',
        type: event?.type ?? DEFAULT_TYPE,
        customLabel: event?.customLabel ?? '',
        color: event?.color || CUSTOM_COLORS[0],
        description: event?.description ?? '',
    });

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const isCustom = form.type === CUSTOM_TYPE;
    const badRange = Boolean(form.endDate) && form.endDate < form.date;
    const missingLabel = isCustom && !form.customLabel.trim();
    const canSave = form.title.trim() && form.date && !badRange && !missingLabel;

    const submit = (e) => {
        e.preventDefault();
        if (!canSave) return;
        onSave(form);
    };

    const field =
        'w-full rounded-lg border border-border-dark bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary';

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
                className="glass-panel max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border-dark p-6"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">
                        {isEdit ? 'Edit event' : 'New event'}
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

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Title
                        </label>
                        <input
                            autoFocus
                            value={form.title}
                            onChange={(e) => update('title', e.target.value)}
                            placeholder="Midterm, demo day, standup…"
                            className={field}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Starts
                            </label>
                            {/* native date input — no picker dependency */}
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => update('date', e.target.value)}
                                className={field}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Ends <span className="normal-case text-gray-600">(optional)</span>
                            </label>
                            <input
                                type="date"
                                value={form.endDate}
                                min={form.date || undefined}
                                onChange={(e) => update('endDate', e.target.value)}
                                className={field}
                            />
                        </div>
                    </div>

                    {badRange && (
                        <p className="-mt-2 text-xs text-red-400">
                            End date must be on or after the start date.
                        </p>
                    )}
                    {!badRange && form.endDate && form.endDate !== form.date && (
                        <p className="-mt-2 text-xs text-gray-500">
                            Spans multiple days — shown as a continuous bar.
                        </p>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Time <span className="normal-case text-gray-600">(optional)</span>
                        </label>
                        <input
                            type="time"
                            value={form.time}
                            onChange={(e) => update('time', e.target.value)}
                            className={field}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {EVENT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => update('type', type.id)}
                                    className={[
                                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all',
                                        form.type === type.id
                                            ? type.chip
                                            : 'border-border-dark text-gray-500 hover:text-white',
                                    ].join(' ')}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${type.dot}`} />
                                    {type.label}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => update('type', CUSTOM_TYPE)}
                                className={[
                                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all',
                                    isCustom
                                        ? 'border-white/40 text-white'
                                        : 'border-border-dark text-gray-500 hover:text-white',
                                ].join(' ')}
                                style={isCustom ? { borderColor: form.color, color: form.color } : undefined}
                            >
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: form.color }}
                                />
                                Custom
                            </button>
                        </div>
                    </div>

                    {isCustom && (
                        <div className="flex flex-col gap-3 rounded-lg border border-border-dark bg-background/60 p-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Type name
                                </label>
                                <input
                                    value={form.customLabel}
                                    onChange={(e) => update('customLabel', e.target.value)}
                                    placeholder="Sprint review, workshop…"
                                    maxLength={40}
                                    className={field}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Colour
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CUSTOM_COLORS.map((hex) => (
                                        <button
                                            key={hex}
                                            type="button"
                                            aria-label={hex}
                                            onClick={() => update('color', hex)}
                                            className={[
                                                'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                                                form.color === hex
                                                    ? 'border-white'
                                                    : 'border-transparent',
                                            ].join(' ')}
                                            style={{ backgroundColor: hex }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Notes <span className="normal-case text-gray-600">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => update('description', e.target.value)}
                            placeholder="Room, syllabus, prep links…"
                            className={`${field} resize-none`}
                        />
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-3">
                        {isEdit ? (
                            <button
                                type="button"
                                onClick={() => onDelete(event)}
                                className="flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        ) : (
                            <span />
                        )}

                        <button
                            type="submit"
                            disabled={saving || !canSave}
                            className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-background disabled:opacity-40"
                        >
                            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add event'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
