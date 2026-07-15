/**
 * Static configuration for the flow canvas.
 *
 * Everything the toolbar renders (shapes, colours, font styles, sizes) is
 * declared here so adding a new tool is a one-line change instead of a code
 * change spread across components. Keep this file free of React / JSX — it is
 * plain data consumed by the toolbar and node components.
 */

import {
    Square,
    Circle,
    Diamond,
    StickyNote,
    Type,
} from 'lucide-react';

/**
 * Node "kinds" the user can drop on the canvas.
 * `type`  -> maps to a registered React Flow nodeType (see nodeTypes.js)
 * `shape` -> passed into shapeNode so one component renders many geometries
 * `size`  -> starting width/height in flow units
 * `data`  -> default data merged with the current toolbar defaults
 */
export const SHAPE_TOOLS = [
    {
        id: 'rectangle',
        label: 'Rectangle',
        icon: Square,
        type: 'shape',
        shape: 'rectangle',
        size: { width: 160, height: 90 },
        data: { label: '' },
    },
    {
        id: 'ellipse',
        label: 'Ellipse',
        icon: Circle,
        type: 'shape',
        shape: 'ellipse',
        size: { width: 140, height: 140 },
        data: { label: '' },
    },
    {
        id: 'diamond',
        label: 'Diamond',
        icon: Diamond,
        type: 'shape',
        shape: 'diamond',
        size: { width: 150, height: 150 },
        data: { label: '' },
    },
    {
        id: 'sticky',
        label: 'Sticky note',
        icon: StickyNote,
        type: 'sticky',
        shape: 'sticky',
        size: { width: 180, height: 180 },
        // sticky notes start warm/yellow; still recolourable from the toolbar
        data: { label: 'Note', fill: '#FEF3C7', stroke: '#F59E0B' },
    },
    {
        id: 'text',
        label: 'Text',
        icon: Type,
        type: 'text',
        shape: 'text',
        size: { width: 200, height: 48 },
        data: { label: 'Text' },
    },
];

/**
 * Muted, whiteboard-friendly palette. `fill` values intentionally soft so the
 * board reads as clean/minimal; `stroke` gives each a matching darker edge.
 */
export const COLOR_SWATCHES = [
    { id: 'white', fill: '#FFFFFF', stroke: '#D4D4D8' },
    { id: 'slate', fill: '#F1F5F9', stroke: '#94A3B8' },
    { id: 'yellow', fill: '#FEF3C7', stroke: '#F59E0B' },
    { id: 'green', fill: '#DCFCE7', stroke: '#22C55E' },
    { id: 'blue', fill: '#DBEAFE', stroke: '#3B82F6' },
    { id: 'violet', fill: '#EDE9FE', stroke: '#8B5CF6' },
    { id: 'pink', fill: '#FCE7F3', stroke: '#EC4899' },
    { id: 'rose', fill: '#FFE4E6', stroke: '#F43F5E' },
];

/** Stroke-only options for outlining nodes. */
export const STROKE_SWATCHES = [
    { id: 'slate', stroke: '#94A3B8' },
    { id: 'ink', stroke: '#334155' },
    { id: 'amber', stroke: '#F59E0B' },
    { id: 'green', stroke: '#22C55E' },
    { id: 'blue', stroke: '#3B82F6' },
    { id: 'violet', stroke: '#8B5CF6' },
    { id: 'pink', stroke: '#EC4899' },
];

/** Text colour swatches. */
export const TEXT_COLORS = [
    { id: 'ink', color: '#1E293B' },
    { id: 'slate', color: '#64748B' },
    { id: 'blue', color: '#2563EB' },
    { id: 'green', color: '#16A34A' },
    { id: 'pink', color: '#DB2777' },
    { id: 'white', color: '#FFFFFF' },
];

/** Heading vs body — heading swaps to the display font used across the app. */
export const TEXT_STYLES = [
    { id: 'heading', label: 'Heading', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 },
    { id: 'body', label: 'Body', fontFamily: "'Inter', sans-serif", fontWeight: 400 },
];

/** Font-weight choices, independent of the heading/body family. */
export const FONT_WEIGHTS = [
    { id: 'light', label: 'Light', value: 300 },
    { id: 'regular', label: 'Regular', value: 400 },
    { id: 'medium', label: 'Medium', value: 500 },
    { id: 'bold', label: 'Bold', value: 700 },
];

/** Discrete font-size stops the stepper cycles through. */
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

/**
 * Finite bounds for the canvas. The board is intentionally NOT infinite — an
 * unbounded canvas can be panned/populated without limit and abused to blow
 * past DB size limits. This 20000×20000 space is huge (feels endless) but
 * bounded. Passed to React Flow's `translateExtent` (limits panning) and
 * `nodeExtent` (limits where nodes can live). Tune here.
 *
 * Format: [[minX, minY], [maxX, maxY]]
 */
export const CANVAS_EXTENT = [
    [-10000, -10000],
    [10000, 10000],
];

/** Defaults applied to newly created nodes and shown when nothing is selected. */
export const DEFAULT_NODE_STYLE = {
    fill: '#FFFFFF',
    stroke: '#D4D4D8',
    color: '#1E293B',
    fontSize: 16,
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textStyle: 'body',
};
