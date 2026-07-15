import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FlowCanvas from "./flowCanvas/flowCanvas.jsx";

/**
 * Team task board. Resolves the team's flowboard id from the backend
 * (get-or-create) and hands it to FlowCanvas, which loads nodes/edges over the
 * existing Yjs+Socket.io collab layer scoped to that board.
 *
 * Without a `:teamId` (the bare /task-board route) it renders the canvas in
 * local-only mode, exactly as before — no regression.
 */
export default function TaskBoard() {
    const { teamId } = useParams();
    const [boardId, setBoardId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!teamId) return;

        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(`/api/v1/task-boards/team/${teamId}`);
                const data = await res.json();
                if (cancelled) return;
                if (res.ok) setBoardId(data.data?._id);
                else setError(data.message || "Could not open the board");
            } catch (err) {
                console.error("Failed to resolve team board:", err);
                if (!cancelled) setError("Could not open the board");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [teamId]);

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-red-400">
                {error}
            </div>
        );
    }

    // Wait for the id before mounting the canvas, so collaboration connects to
    // the right room on first render. Bare /task-board (no teamId) mounts local.
    if (teamId && !boardId) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-gray-500">
                Opening board…
            </div>
        );
    }

    return (
        <div className="h-screen">
            <FlowCanvas boardId={boardId} />
        </div>
    );
}
