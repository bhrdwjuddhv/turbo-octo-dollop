import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';

/**
 * Owner-only: edit team name, logo (teamAvatar) and banner (bannerImage).
 * Sends multipart FormData to the existing PATCH /:teamId (multer) endpoint —
 * only fields the owner actually changed are included.
 */
export default function TeamEditModal({ team, saving, onSave, onClose }) {
    const [name, setName] = useState(team.name ?? '');
    const [avatar, setAvatar] = useState(null);
    const [banner, setBanner] = useState(null);

    const submit = () => {
        const form = new FormData();
        if (name.trim() && name !== team.name) form.append('name', name.trim());
        if (avatar) form.append('teamAvatar', avatar);
        if (banner) form.append('bannerImage', banner);
        onSave(form);
    };

    const fileRow = (label, current, file, setFile, accept = 'image/*') => (
        <div>
            <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-gray-500">
                {label}
            </label>
            <label className="flex cursor-pointer items-center gap-3 border border-white/10 bg-background px-3 py-2 text-xs text-gray-400 hover:border-primary">
                <Upload className="h-4 w-4" />
                <span className="truncate">{file ? file.name : 'Choose a file…'}</span>
                <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
            </label>
        </div>
    );

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
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tighter">Edit team</h3>
                    <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-gray-500">
                            Team name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            className="w-full border border-white/10 bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                        />
                    </div>

                    {fileRow('Logo', team.teamAvatar, avatar, setAvatar)}
                    {fileRow('Banner', team.bannerImage, banner, setBanner)}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        className="border border-primary bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-background disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
