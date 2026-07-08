import FloatingEdge from './floatingEdge.jsx';

/**
 * Edge registry. `floating` is the default edge type used across the board so
 * every connection routes border-to-border (see floatingEdge.jsx). Declared
 * once, outside the component, so React Flow doesn't get a new object each render.
 */
export const edgeTypes = {
    floating: FloatingEdge,
};
