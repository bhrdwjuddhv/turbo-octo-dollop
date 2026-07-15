import { Position } from '@xyflow/react';

/**
 * Geometry helpers for floating edges.
 *
 * This follows React Flow's official "floating edges" pattern (compute where an
 * edge meets a node's border instead of snapping to a fixed handle), but makes
 * the intersection *shape-aware* so the endpoint lands exactly on the visible
 * outline of each shape — including ellipses and diamonds, which is where the
 * default fixed-handle edges leave an obvious gap.
 *
 * Reference: https://reactflow.dev/examples/edges/floating-edges
 */

/** Absolute centre + half-extents + shape kind of an internal node. */
function getGeometry(node) {
    const width = node.measured?.width ?? node.width ?? 0;
    const height = node.measured?.height ?? node.height ?? 0;
    const { x, y } = node.internals.positionAbsolute;
    return {
        cx: x + width / 2,
        cy: y + height / 2,
        w: width / 2,
        h: height / 2,
        shape: node.data?.shape ?? 'rectangle',
    };
}

/**
 * Point where the ray from a node's centre toward (targetX, targetY) crosses
 * that node's border. Solves the ray/boundary equation per shape:
 *   rectangle : max(|dx|/w, |dy|/h) = 1
 *   ellipse   : (dx/w)² + (dy/h)²  = 1
 *   diamond   : |dx|/w + |dy|/h     = 1
 * so the endpoint sits precisely on the outline with no gap.
 */
export function getShapeIntersection(node, targetX, targetY) {
    const { cx, cy, w, h, shape } = getGeometry(node);
    const dx = targetX - cx;
    const dy = targetY - cy;

    if ((dx === 0 && dy === 0) || w === 0 || h === 0) {
        return { x: cx, y: cy };
    }

    let t;
    switch (shape) {
        case 'ellipse':
            t = 1 / Math.sqrt((dx / w) ** 2 + (dy / h) ** 2);
            break;
        case 'diamond':
            t = 1 / (Math.abs(dx) / w + Math.abs(dy) / h);
            break;
        default: // rectangle, sticky, text (bounding-box)
            t = 1 / Math.max(Math.abs(dx) / w, Math.abs(dy) / h);
    }

    return { x: cx + dx * t, y: cy + dy * t };
}

/** Which side of the node an intersection point sits on (for bezier tangents). */
function getBorderSide(node, point) {
    const { cx, cy } = getGeometry(node);
    const dx = point.x - cx;
    const dy = point.y - cy;
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? Position.Right : Position.Left;
    }
    return dy > 0 ? Position.Bottom : Position.Top;
}

/**
 * Everything a bezier path needs to connect two nodes border-to-border:
 * source/target coordinates + the side each endpoint leaves from.
 */
export function getEdgeParams(source, target) {
    const s = getGeometry(source);
    const t = getGeometry(target);

    const sourcePoint = getShapeIntersection(source, t.cx, t.cy);
    const targetPoint = getShapeIntersection(target, s.cx, s.cy);

    return {
        sx: sourcePoint.x,
        sy: sourcePoint.y,
        tx: targetPoint.x,
        ty: targetPoint.y,
        sourcePos: getBorderSide(source, sourcePoint),
        targetPos: getBorderSide(target, targetPoint),
    };
}
