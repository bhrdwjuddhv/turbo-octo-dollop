import { getBezierPath } from '@xyflow/react';
import { getShapeIntersection } from './floatingEdgeUtils.js';

/**
 * The in-progress line shown while the user drags a new connection. Matches the
 * floating edge look: it leaves the source node's border (not a fixed handle)
 * and follows the cursor to a small target dot.
 */
export default function FloatingConnectionLine({ toX, toY, fromNode }) {
    if (!fromNode) return null;

    const { x: sx, y: sy } = getShapeIntersection(fromNode, toX, toY);

    const [edgePath] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        targetX: toX,
        targetY: toY,
    });

    return (
        <g>
            <path
                fill="none"
                stroke="#6366f1"
                strokeWidth={2}
                className="animated"
                d={edgePath}
            />
            <circle
                cx={toX}
                cy={toY}
                r={3.5}
                fill="#fff"
                stroke="#6366f1"
                strokeWidth={2}
            />
        </g>
    );
}
