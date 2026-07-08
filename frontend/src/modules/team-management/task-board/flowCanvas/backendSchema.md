# Flow Canvas — Backend Schema

This document describes how the backend should be structured to **save and load**
the flows produced by the React Flow canvas in this folder. It is a spec only —
no backend is implemented here. Field names and the example payloads match the
**exact shape** of the React Flow state the frontend emits, so a round-trip
(`load → edit → save → load`) needs no transformation on either side.

---

## 1. Data model

Three entities: a **Board** (a.k.a. flow) owns many **Nodes** and many **Edges**.

### 1.1 Board (a.k.a. flowboard)

Each flowboard has **its own id** and belongs to exactly one team via `teamId`.

| Field         | Type                   | Notes                                                        |
|---------------|------------------------|-------------------------------------------------------------|
| `_id`         | ObjectId               | Primary key (MongoDB `_id`). Serialised as a 24-char hex string in JSON. |
| `teamId`      | ObjectId (FK → team)   | **Owning team.** Required. Indexed (see §1.4).               |
| `title`       | string                 | Human-readable board name. Default `"Untitled board"`.      |
| `createdBy`   | ObjectId (FK → user)   | Author.                                                     |
| `viewport`    | object \| null         | Last saved pan/zoom: `{ x: number, y: number, zoom: number }`. Optional; the frontend falls back to `fitView` when absent. |
| `nodes`       | Node[]                 | See §1.2. Embedded array (recommended) or a related collection. |
| `edges`       | Edge[]                 | See §1.3.                                                   |
| `createdAt`   | ISO 8601 string        | (Mongoose `timestamps` gives this for free.)                |
| `updatedAt`   | ISO 8601 string        |                                                             |

> **Not stored:** `translateExtent` / `nodeExtent` are fixed client-side config
> (`CANVAS_EXTENT` in `config/canvasConfig.js`), not per-board data. Node
> positions are already clamped to those bounds on the frontend, but the backend
> should still **reject nodes whose `position` falls outside the extent** as a
> safety check (see §5) so a crafted payload can't grow the board unboundedly.

### 1.2 Node

Mirrors a React Flow node. `position`, `width`, `height`, and `type` are
top-level (React Flow reads them directly); everything visual lives in `data`.

| Field       | Type                                             | Notes                                                                 |
|-------------|--------------------------------------------------|-----------------------------------------------------------------------|
| `id`        | string                                           | Unique within the board (frontend uses `crypto.randomUUID()`).        |
| `type`      | `"shape" \| "sticky" \| "text" \| "textUpdater"` | Maps to a registered `nodeType`. Must be persisted verbatim.          |
| `position`  | `{ x: number, y: number }`                       | Canvas coordinates (not screen). Required.                            |
| `width`     | number                                           | Current width in flow units (updated by the resize handles).          |
| `height`    | number                                           | Current height in flow units.                                         |
| `data`      | object                                           | Node properties — see below.                                          |

**`node.data` properties**

| Field        | Type                                                    | Notes                                                        |
|--------------|---------------------------------------------------------|--------------------------------------------------------------|
| `label`      | string                                                  | Text content (may be empty or multi-line).                   |
| `shape`      | `"rectangle" \| "ellipse" \| "diamond" \| "sticky" \| "text"` | Geometry for `shape`/`sticky`/`text` nodes.            |
| `fill`       | string (hex, e.g. `"#FFFFFF"`)                          | Background colour.                                            |
| `stroke`     | string (hex)                                            | Border colour.                                               |
| `color`      | string (hex)                                            | Text colour.                                                 |
| `fontSize`   | number                                                  | Pixels.                                                      |
| `fontWeight` | number (`300 \| 400 \| 500 \| 700`)                     | CSS font-weight.                                             |
| `fontFamily` | string                                                  | e.g. `"'Inter', sans-serif"` / `"'Space Grotesk', sans-serif"`. |
| `textStyle`  | `"heading" \| "body"`                                   | Which typographic preset is active.                          |

> Store `data` as an opaque JSON blob (JSONB / embedded document). The frontend
> owns its shape and may add keys as new tools are introduced; the backend
> should **round-trip unknown keys untouched** rather than validating each one.

### 1.3 Edge

Mirrors a React Flow edge as produced by `addEdge` with the canvas's
`defaultEdgeOptions`.

| Field          | Type            | Notes                                                              |
|----------------|-----------------|--------------------------------------------------------------------|
| `id`           | string          | React Flow auto-generates, e.g. `"xy-edge__<src><srcHandle>-<tgt><tgtHandle>"`. |
| `source`       | string          | Source `node.id`.                                                  |
| `target`       | string          | Target `node.id`.                                                  |
| `sourceHandle` | string \| null  | Handle id on the source side (`"t" \| "r" \| "b" \| "l"`, or `null`). |
| `targetHandle` | string \| null  | Handle id on the target side (`"t" \| "r" \| "b" \| "l"`, or `null`). |
| `type`         | string          | `"floating"` — custom edge that routes to the shape's border.     |
| `markerEnd`    | object          | Arrowhead: `{ type: "arrowclosed", color: "#94a3b8" }`.          |

> The edge `type` is `"floating"` (the board's default). The backend just
> persists it verbatim — endpoint geometry is recomputed on the frontend from
> live node positions, so no coordinates are stored on the edge.

### 1.4 Enforcing "max 1 flowboard per team (unless premium)"

**Rule to design for:** a team may own **at most one** flowboard, *unless the
team is premium*, in which case it may own many.

**Do NOT use a DB unique index on `teamId`.** A `unique: true` index on `teamId`
would cap *every* team at one board — it would **wrongly block premium teams**
from creating a second board, and a partial/conditional unique index can't
consult the team's live premium flag. Uniqueness here is a business rule, not a
data-integrity invariant, so enforce it in the **application layer**:

```txt
On POST /task-boards (create):
  1. Load the owning team (or its plan flag).
  2. If team is NOT premium:
       count = boards.countDocuments({ teamId })
       if (count >= 1) -> 409 Conflict "Free teams are limited to one board.
                                        Upgrade to premium for more."
  3. Otherwise (premium, or count === 0) -> create the board.
```

- Keep this check **inside the create handler / service** so it runs on every
  creation path. Do it in a transaction (or re-check after insert) if you need
  to be strict about a race between two simultaneous creates.
- `premium` should come from the **team** (e.g. `team.plan === "premium"` or
  `team.isPremium`), not the board.

**Index that DOES help:** a **non-unique** index on `teamId`
(`boards.createIndex({ teamId: 1 })`). It makes the "list boards for a team" and
the create-time `countDocuments({ teamId })` lookups fast, without imposing the
one-per-team cap. (Optionally a compound `{ teamId: 1, updatedAt: -1 }` for
sorted listings.)

---

## 2. Relationships

```
Team (1) ─────< Board (many, but 1 unless premium — see §1.4)   // board.teamId
Board (1) ─────< Node (many)     // board.nodes[]
Board (1) ─────< Edge (many)     // board.edges[]
Node  (1) ─────< Edge (as source/target, via edge.source / edge.target)
```

- A **Board** is the aggregate root. Nodes and edges have no meaning outside
  their board, so the simplest model is to embed `nodes` and `edges` as arrays
  on the board document (MongoDB) or as child tables with `boardId` FK (SQL).
- Deleting a board cascades to its nodes and edges.
- `edge.source` / `edge.target` reference `node.id` **within the same board**.
  Deleting a node should delete edges that reference it (the frontend already
  does this locally on delete, but enforce it server-side for integrity).

---

## 3. Example payloads

### 3.1 Save — request body (`PUT /task-boards/:id`)

This is the **exact** object the frontend serialises from React Flow state
(`{ nodes, edges }` plus board metadata):

```json
{
  "_id": "665f1c0a3e2b7d4c9a9f2181",
  "teamId": "665aa0b1c2d3e4f5a6b7c8d9",
  "title": "Sprint 12 — Task Board",
  "viewport": { "x": -120.5, "y": 40, "zoom": 1.15 },
  "nodes": [
    {
      "id": "node-1",
      "type": "shape",
      "position": { "x": 0, "y": 0 },
      "width": 160,
      "height": 90,
      "data": {
        "label": "Start here",
        "shape": "rectangle",
        "fill": "#FFFFFF",
        "stroke": "#D4D4D8",
        "color": "#1E293B",
        "fontSize": 16,
        "fontWeight": 400,
        "fontFamily": "'Inter', sans-serif",
        "textStyle": "body"
      }
    },
    {
      "id": "b2f8e4d1-77aa-4c2e-9a0b-1d3c5e7f9a02",
      "type": "sticky",
      "position": { "x": 260, "y": 40 },
      "width": 180,
      "height": 180,
      "data": {
        "label": "Ship the login flow",
        "shape": "sticky",
        "fill": "#FEF3C7",
        "stroke": "#F59E0B",
        "color": "#1E293B",
        "fontSize": 16,
        "fontWeight": 400,
        "fontFamily": "'Inter', sans-serif",
        "textStyle": "body"
      }
    },
    {
      "id": "c9a1d0e2-33bb-4f5a-8c1d-2e4f6a8b0c13",
      "type": "text",
      "position": { "x": 40, "y": -80 },
      "width": 220,
      "height": 48,
      "data": {
        "label": "Milestones",
        "shape": "text",
        "fill": "#FFFFFF",
        "stroke": "#D4D4D8",
        "color": "#1E293B",
        "fontSize": 28,
        "fontWeight": 700,
        "fontFamily": "'Space Grotesk', sans-serif",
        "textStyle": "heading"
      }
    }
  ],
  "edges": [
    {
      "id": "xy-edge__node-1r-b2f8e4d1-77aa-4c2e-9a0b-1d3c5e7f9a02l",
      "source": "node-1",
      "target": "b2f8e4d1-77aa-4c2e-9a0b-1d3c5e7f9a02",
      "sourceHandle": "r",
      "targetHandle": "l",
      "type": "floating",
      "markerEnd": { "type": "arrowclosed", "color": "#94a3b8" }
    }
  ]
}
```

### 3.2 Load — response body (`GET /task-boards/:id`)

Return the **same** shape you were given on save, wrapped in the API envelope
this repo already uses (`{ success, data }`, matching the `team` module):

```json
{
  "success": true,
  "data": {
    "_id": "665f1c0a3e2b7d4c9a9f2181",
    "teamId": "665aa0b1c2d3e4f5a6b7c8d9",
    "title": "Sprint 12 — Task Board",
    "createdBy": "665bb1c2d3e4f5a6b7c8d9e0",
    "viewport": { "x": -120.5, "y": 40, "zoom": 1.15 },
    "nodes": [ /* … same node objects as above … */ ],
    "edges": [ /* … same edge objects as above … */ ],
    "createdAt": "2026-07-08T10:15:00.000Z",
    "updatedAt": "2026-07-09T09:02:11.000Z"
  }
}
```

The frontend hands `data.nodes` straight to `useNodesState` and `data.edges`
straight to `useEdgesState` — **no remapping**. If `viewport` is present it can
be applied via `setViewport`; otherwise the canvas uses `fitView`.

---

## 4. Suggested REST endpoints

Base path suggestion (consistent with the existing `/api/v1/...` routes):
`/api/v1/task-boards`.

| Method   | Path                        | Purpose                                             | Body / Returns                                    |
|----------|-----------------------------|-----------------------------------------------------|---------------------------------------------------|
| `POST`   | `/task-boards`              | **Create** a board. **Enforces the premium rule (§1.4)** before insert. | Body: `{ teamId, title?, nodes?, edges?, viewport? }` → `201` created board, or `409` if a free team already has one. |
| `GET`    | `/task-boards/:id`          | **Read** one board with its nodes + edges.          | → `{ success, data: Board }` (see 3.2).           |
| `GET`    | `/task-boards?teamId=…`     | **List** boards for a team (metadata only).         | → `{ success, data: Board[] }` (omit `nodes`/`edges` for a light list). Uses the `teamId` index (§1.4). |
| `PUT`    | `/task-boards/:id`          | **Update** — full replace of nodes/edges/viewport.  | Body: full board (see 3.1). Idempotent whole-flow save. |
| `PATCH`  | `/task-boards/:id`          | **Partial update** — e.g. rename (`{ title }`).     | Body: subset of board fields.                     |
| `DELETE` | `/task-boards/:id`          | **Delete** a board (cascade nodes + edges).         | → `{ success: true }`.                            |

**Save strategy:** the frontend holds the entire `{ nodes, edges }` in memory,
so the simplest correct approach is a **whole-flow replace** on `PUT` (delete +
reinsert children, or overwrite the embedded arrays). Per-node/edge diffing is
an optimisation, not a requirement. Debounce/autosave can call `PUT` on change.

**Authorisation:** every endpoint should verify the caller belongs to the
board's `teamId` (reuse the existing team-membership middleware). `POST`
additionally runs the premium/count check from §1.4.

**Validation:** on create/update, reject any node whose `position` lies outside
`CANVAS_EXTENT` (`[[-10000,-10000],[10000,10000]]`) and cap the node/edge count,
so a hand-crafted payload can't bypass the client-side bounds.

---

## 5. What the frontend expects back

- **Same shape in as out.** Whatever `nodes`/`edges` objects are POSTed/PUT must
  come back byte-for-byte on `GET` (positions, `width`/`height`, and the full
  `data` blob). React Flow is the source of truth for these fields.
- **`data` is opaque.** Do not strip, reorder, or coerce keys inside `node.data`
  (e.g. keep `fontWeight` a number, keep hex strings as-is). New tools will add
  keys; persist unknown keys transparently.
- **Node/edge `id`s are client-generated** and must be preserved so existing
  edges keep pointing at the right nodes. Do not reassign them on save. (The
  board's own `_id`, by contrast, is server-generated on create and echoed back.)
- **Nullable handles.** `sourceHandle` / `targetHandle` may be `null`; keep them
  null rather than dropping the field.
- **Envelope.** Wrap responses in `{ success, data }` (and `{ success, message }`
  on error) to match the existing `team`/`matching` modules' fetch handling.
- **Numbers stay numbers.** `position.x/y`, `width`, `height`, `fontSize`,
  `fontWeight`, and `viewport.zoom` must serialise as JSON numbers, not strings.
