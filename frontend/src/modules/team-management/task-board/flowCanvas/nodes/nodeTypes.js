import ShapeNode from './shapeNode.jsx';
import StickyNode from './stickyNode.jsx';
import TextNode from './textNode.jsx';
import TextUpdaterNode from '../textUpdaterNode.jsx';

/**
 * Central registry mapping a node's `type` -> its React component.
 * Keys here must match the `type` values produced in canvasConfig.SHAPE_TOOLS.
 * Declared once, outside the component, so React Flow doesn't see a new object
 * on every render.
 */
export const nodeTypes = {
    shape: ShapeNode,
    sticky: StickyNode,
    text: TextNode,
    textUpdater: TextUpdaterNode,
};
