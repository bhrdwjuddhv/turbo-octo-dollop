import { getBezierPath, useInternalNode } from '@xyflow/react';
import { getEdgeParams } from './floatingEdgeUtils.js';

/**
 * Custom "floating" edge. Instead of snapping to a fixed handle anchor (which
 * leaves a gap between the line and round/diamond shapes), it recomputes its
 * endpoints on every render from the two nodes' live positions so both ends
 * sit exactly on the shapes' borders.
 *
 * `useInternalNode` subscribes to the store, so the edge re-routes as nodes are
 * dragged or resized.
 */
export default function FloatingEdge({ id, source, target, markerEnd, style }) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) return null;

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode,
    );

    const [edgePath] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetX: tx,
        targetY: ty,
        targetPosition: targetPos,
    });

    return (
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
            style={style}
        />
    );
}
