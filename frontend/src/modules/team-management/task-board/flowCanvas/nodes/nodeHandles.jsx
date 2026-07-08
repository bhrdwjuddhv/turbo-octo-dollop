import { Handle, Position } from '@xyflow/react';

/**
 * Four connection points (top / right / bottom / left). The canvas runs in
 * `ConnectionMode.Loose`, so a single handle per side can act as both source
 * and target — an edge can start or end on any of them. Handles stay invisible
 * until the node is hovered/selected (see the `.rf-handle` rules in
 * flowCanvas.css) to keep the board uncluttered.
 *
 * Edges route border-to-border regardless of which handle is used — see the
 * floating edge in ../edges — so these dots are just the grab points, not the
 * visual anchor.
 */
const SIDES = [
    { position: Position.Top, id: 't' },
    { position: Position.Right, id: 'r' },
    { position: Position.Bottom, id: 'b' },
    { position: Position.Left, id: 'l' },
];

export default function NodeHandles() {
    return (
        <>
            {SIDES.map(({ position, id }) => (
                <Handle
                    key={id}
                    type="source"
                    position={position}
                    id={id}
                    className="rf-handle"
                />
            ))}
        </>
    );
}
