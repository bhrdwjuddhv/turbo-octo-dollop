import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';

/**
 * Request-to-join dialog. Instead of joining instantly, the user writes an
 * optional note to the owner and submits a JOIN REQUEST (POST /:teamId/join),
 * which the owner approves later from their dashboard.
 */
export default function JoinRequestDialog({ teamName, submitting, onSubmit, onClose }) {
    const [note, setNote] = useState('');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-panel w-full max-w-md border border-white/10 p-6"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tighter">
                        Request to join
                    </h3>
                    <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mb-4 text-xs font-mono text-gray-500">
                    Send a note to the owner of <span className="text-primary">{teamName}</span> telling
                    them why you'd be a good fit.
                </p>

                <textarea
                    autoFocus
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    placeholder="I build backends in Node and I'm free this weekend…"
                    className="w-full resize-none border border-white/10 bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(note)}
                        disabled={submitting}
                        className="flex items-center gap-2 border border-primary bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-background disabled:opacity-50"
                    >
                        <Send className="h-3.5 w-3.5" />
                        {submitting ? 'Sending…' : 'Send request'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
