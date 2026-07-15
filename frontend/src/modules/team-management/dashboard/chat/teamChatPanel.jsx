import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import useTeamChat from './useTeamChat.js';

const senderName = (m) => m.senderId?.fullName || m.senderId?.username || 'Unknown';

const timeLabel = (iso) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

/**
 * Slide-in team chat drawer. History via REST, live via the shared /team-chat
 * socket. Own messages align right (neon), others left. Scroll to the top loads
 * older history, preserving the reading position.
 */
export default function TeamChatPanel({ teamId, teamName, onClose }) {
    const { user } = useAuth();
    const { messages, sendMessage, loadOlder, hasMore, loadingOlder, connected } =
        useTeamChat({ teamId, enabled: true });

    const [draft, setDraft] = useState('');
    const scrollRef = useRef(null);
    const anchorRef = useRef(null); // scrollHeight captured before a prepend
    const nearBottomRef = useRef(true);
    const lastIdRef = useRef(null);

    const onScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (el.scrollTop < 40 && hasMore && !loadingOlder) {
            anchorRef.current = el.scrollHeight; // restore position after prepend
            loadOlder();
        }
    };

    // Keep the viewport sensible as messages change: restore position after an
    // older-history prepend, otherwise follow new messages to the bottom.
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const newestId = messages.length ? messages[messages.length - 1]._id : null;

        if (anchorRef.current != null) {
            el.scrollTop = el.scrollHeight - anchorRef.current;
            anchorRef.current = null;
        } else if (newestId !== lastIdRef.current && nearBottomRef.current) {
            el.scrollTop = el.scrollHeight;
        }
        lastIdRef.current = newestId;
    }, [messages]);

    // Land at the bottom on first open.
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        sendMessage(draft);
        setDraft('');
    };

    return (
        <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-black/95 backdrop-blur-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tighter">{teamName} chat</h3>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-gray-500">
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-primary' : 'bg-gray-600'}`}
                        />
                        {connected ? 'Live' : 'Connecting…'}
                    </span>
                </div>
                <button onClick={onClose} aria-label="Close chat" className="text-gray-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                onScroll={onScroll}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
                {loadingOlder && (
                    <p className="text-center text-[10px] font-mono uppercase text-gray-600">
                        Loading older…
                    </p>
                )}
                {!hasMore && messages.length > 0 && (
                    <p className="text-center text-[10px] font-mono uppercase text-gray-700">
                        Start of conversation
                    </p>
                )}

                {messages.map((m) => {
                    const mine = m.senderId?._id === user?._id;
                    return (
                        <div key={m._id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                            {!mine && (
                                <span className="mb-0.5 px-1 text-[10px] font-mono uppercase text-gray-500">
                                    {senderName(m)}
                                </span>
                            )}
                            <div
                                className={[
                                    'max-w-[80%] break-words border px-3 py-2 text-sm',
                                    mine
                                        ? 'border-primary/40 bg-primary/10 text-primary'
                                        : 'border-white/10 bg-white/5 text-gray-200',
                                ].join(' ')}
                            >
                                {m.text}
                            </div>
                            <span className="mt-0.5 px-1 text-[9px] font-mono text-gray-600">
                                {timeLabel(m.createdAt)}
                            </span>
                        </div>
                    );
                })}

                {messages.length === 0 && (
                    <p className="pt-10 text-center text-xs font-mono text-gray-600">
                        No messages yet. Say hi 👋
                    </p>
                )}
            </div>

            {/* Composer */}
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-3">
                <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Message your team…"
                    maxLength={2000}
                    className="flex-1 border border-white/10 bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />
                <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Send"
                    className="flex h-9 w-9 items-center justify-center border border-primary bg-primary/10 text-primary transition-all hover:bg-primary hover:text-background disabled:opacity-40"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </motion.aside>
    );
}
