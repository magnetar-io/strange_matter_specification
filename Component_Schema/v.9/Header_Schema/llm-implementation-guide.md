# Strange Matter Component - LLM Implementation Guide

> **Purpose:** Instructions for LLMs and coding agents on how to create valid Strange Matter Component type definitions from the schema.

## 1. Understanding Component Types vs Instances

**Critical concept:** This schema defines **component type definitions**, not individual data instances.

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT TYPE DEFINITION                                      │
│  Name: Acme_geojson_polygon                                     │
│  ├── ComponentInfo: metadata about THIS TYPE (version, author) │
│  ├── PayloadSchema: defines the data structure                 │
│  └── PayloadDataType: geojson                                  │
├─────────────────────────────────────────────────────────────────┤
│  CLASSIFICATION (use case within type)                          │
│  ComponentClassification: building_footprint                    │
├─────────────────────────────────────────────────────────────────┤
│  USAGE (how this component is being used)                       │
│  UsedAsA: Instance | Typical | Archetype | ...                  │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Field | Example | Purpose |
|-------|-------|---------|---------|
| **Type** | `Name` | `Acme_geojson_polygon` | Self-documenting type tied to format + data shape |
| **Classification** | `ComponentClassification` | `building_footprint` | Specific use case within the type |
| **Usage** | `UsedAsA` | `Instance`, `Typical`, `Archetype` | How this particular component is being used |

**Key insight:** `ComponentInfo` (version, author, sourceurl, publishdate) describes **when and who created the type definition itself**, not the data instances.

---

## 2. Naming Convention

**Pattern:** `<institution>_<format>_<specific-data-type>`

| Name | Institution | Format | Data Type | Consumer Knows |
|------|-------------|--------|-----------|----------------|
| `Acme_geojson_polygon` | Acme | geojson | polygon | Expect polygon geometries only |
| `Acme_geojson_point` | Acme | geojson | point | Expect point geometries only |
| `Acme_geojson_linestring` | Acme | geojson | linestring | Expect linestring geometries only |
| `Contoso_json_email` | Contoso | json | email | Expect email content structure |
| `Contoso_json_meetingnotes` | Contoso | json | meetingnotes | Expect meeting notes structure |
| `GlobalCorp_json_specification` | GlobalCorp | json | specification | Expect spec document structure |

**Why this order?**
1. Groups all of an institution's types together
2. Then groups by format (all geojson types, all json types)
3. Then by specific data shape

**Self-documenting:** Consumers know exactly what data to expect just from the name—no need to read the full schema.

---

## 3. Pre-Creation Checklist

Before generating a component, gather the following from the user:

### Required Information

| Information | Used For | Example |
|-------------|----------|---------|
| Institution/organization name | `Name` prefix | `Acme` |
| Format | `Name` middle, `PayloadDataType` | `geojson`, `json` |
| Specific data type | `Name` suffix | `polygon`, `email`, `meetingnotes` |
| Classification/use case | `ComponentClassification` | `building_footprint` |
| Author email | `DataAuthorIdentifier` | `john.smith@acme.com` |
| Source location | `Context` URI base | URL or file path |
| Project name | `Context` query param | `Tower Project` |
| Project number | `Context` query param | `P-2024-001` |

### Optional Information

| Information | Used For | Default Behavior |
|-------------|----------|------------------|
| **Real GUID from source** (Revit UniqueId, DB UUID, MessageID, file hash) | `EntityGUID` | Generate UUID v7 if not available |
| **All source identifiers** (names, codes, other IDs) | `ForeignIDs` | Empty object `{}` if none |
| Version identifier | `ComponentInfo.version` | `["1.0"]` |
| Components to extend | `Extends` | Empty array `[]` |
| Actions to perform | `Action` | Empty array `[]` |

> **Important:** Ask specifically: "Does the source have a real GUID, UUID, or system-generated ID?" Names, project numbers, and human-readable codes are NOT valid for EntityGUID—those go in ForeignIDs.

---

## 4. GUID Generation Strategy

### EntityGUID
**Must be a real GUID/UUID or a robust, immutable unique identifier.**

EntityGUID should only come from source data if it's a **true identifier**, not something fragile like a name or title.

| Source Type | Valid EntityGUID | Why |
|-------------|------------------|-----|
| Email | MessageID (e.g., `<abc123@mail.example.com>`) | Immutable, system-generated |
| Database record | Primary key GUID | True unique identifier |
| Revit/BIM element | ElementId or UniqueId | System-assigned |
| File on disk | File content hash (SHA-256 or MD5) | Stable for unchanged content |
| API response | Record UUID | System-generated |

**Invalid for EntityGUID** (use ForeignIDs instead):
- Document names or titles
- Project numbers
- Email subjects
- Human-assigned codes

**If no robust identifier exists → Generate UUID v7**

### ComponentGUID and ComponentVersionGUID
**Always generate UUID v7 at creation time.**

These rarely exist in source data (exception: data from Revit or other modeling tools that may provide their own GUIDs).

### ForeignIDs
**Capture all identifiers from source data—both robust and fragile—with their original key names.**

ForeignIDs serves as the complete identifier registry:
- Other GUIDs from external systems
- Human-readable identifiers (names, numbers, codes)
- Legacy system references

```json
"ForeignIDs": {
  "revit_unique_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  "sharepoint_item_id": "abc-def-ghi",
  "project_number": "P-2024-001",
  "document_name": "Tower-FloorPlan-L1",
  "legacy_system_code": "BLD-001-A",
  "email_subject": "Q3 Budget Review Meeting"
}
```

### Decision Tree: EntityGUID

```
Does source have a real GUID/UUID?
├── Yes → Use it as EntityGUID
└── No → Does source have a robust unique ID (MessageID, hash)?
         ├── Yes → Use it as EntityGUID
         └── No → Is this a file?
                  ├── Yes → Compute file hash as EntityGUID
                  └── No → Generate UUID v7 as EntityGUID

In ALL cases: Capture ALL source identifiers in ForeignIDs
```

### Python Code: EntityGUID Selection

```python
import uuid
import hashlib

def determine_entity_guid(
    source_guid: str | None = None,
    message_id: str | None = None,
    file_path: str | None = None,
    file_content: bytes | None = None
) -> str:
    """
    Determine the EntityGUID based on source data.
    
    Priority:
    1. Real GUID from source system
    2. Robust unique ID (email MessageID)
    3. File content hash
    4. Generate new UUID v7
    """
    # Priority 1: Real GUID from source
    if source_guid:
        return source_guid
    
    # Priority 2: Robust unique ID like email MessageID
    if message_id:
        return message_id
    
    # Priority 3: File content hash
    if file_content:
        return hashlib.sha256(file_content).hexdigest()
    if file_path:
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    
    # Priority 4: Generate new UUID v7
    return str(uuid.uuid7())

# Generate ComponentGUID and ComponentVersionGUID (always new)
component_guid = str(uuid.uuid7())
component_version_guid = str(uuid.uuid7())
```

> **Note:** Python 3.11+ includes `uuid.uuid7()`. For earlier versions, use the `uuid7` package: `pip install uuid7`

---

## 5. Context URI Construction

The `Context` field is a parameterized URI that identifies where this component was created.

### Required Query Parameters (always first)
- `projectName` - Human-readable project name
- `projectNumber` - Project identifier/number

### Web-Hosted Data

```
https://company.sharepoint.com/sites/projects?projectName=Tower%20Project&projectNumber=P-2024-001&docType=specification
```

### File-Based Data

```
file:///C:/Projects/TowerProject?projectName=Tower%20Project&projectNumber=P-2024-001&source=local
```

### Python Code: Context URI Construction

```python
from urllib.parse import urlencode, quote

def build_context_uri(base_url: str, project_name: str, project_number: str, **extra_params) -> str:
    """
    Build a Context URI with required params first.
    
    Args:
        base_url: The base URL or file path (e.g., 'https://host.com/path' or 'file:///C:/Projects')
        project_name: Human-readable project name
        project_number: Project identifier
        **extra_params: Additional query parameters
    
    Returns:
        Properly formatted Context URI
    """
    # Required params always come first
    params = {
        'projectName': project_name,
        'projectNumber': project_number,
        **extra_params
    }
    
    query_string = urlencode(params)
    return f"{base_url}?{query_string}"

# Example usage:
context = build_context_uri(
    base_url="https://acme.sharepoint.com/sites/engineering",
    project_name="Tower Project",
    project_number="P-2024-001",
    docType="floorplan",
    version="1.0"
)
# Result: https://acme.sharepoint.com/sites/engineering?projectName=Tower+Project&projectNumber=P-2024-001&docType=floorplan&version=1.0
```

---

## 6. SpatialContext Construction

The `SpatialContext` field preserves hierarchical spatial metadata so location information isn't lost when data moves between systems.

### Structure
An array of arrays, where each inner array represents one spatial context level:

```
[contextType, key1, value1, key2, value2, ...]
```

### Context Types

| Type | Purpose | Common Keys |
|------|---------|-------------|
| `room` | Room-level spatial context | `number`, `name`, `roomGUID`, `area`, `function` |
| `level` | Floor/story information | `number`, `name`, `elevation`, `levelGUID` |
| `building` | Building identification | `name`, `code`, `buildingGUID`, `address` |
| `site` | Site/campus level | `name`, `siteGUID`, `address` |
| `zone` | Zoning or classification | `name`, `type`, `zoneGUID` |
| `area` | Named area within a space | `name`, `areaGUID`, `function` |
| `coordinateSystem` | Geospatial reference | `EPSG`, `statePlane`, `projection`, `datum` |

### Key Principle: Capture ALL Identifiers

Just like ForeignIDs, include **every identifier** you have for each spatial level—GUIDs, human-readable names, codes, numbers. The goal is to preserve enough metadata that any downstream system can match or locate the data.

### Example: BIM/Architectural Data

```json
"SpatialContext": [
  ["room", "number", "101", "name", "Conference Room A", "roomGUID", "3f2504e0-4f89-11d3-9a0c-0305e82c3301", "area_sqft", "450"],
  ["level", "number", "1", "name", "Ground Floor", "elevation", "0.0", "levelGUID", "4a2614f1-5g9a-22e4-0b1d-1416e93d4412"],
  ["building", "name", "Tower A", "code", "TWR-A", "buildingGUID", "5b3725g2-6h0b-33f5-1c2e-2527f04e5523"],
  ["site", "name", "Corporate Campus", "siteGUID", "6c4836h3-7i1c-44g6-2d3f-3638g15f6634"]
]
```

### Example: Geospatial/GIS Data

```json
"SpatialContext": [
  ["coordinateSystem", "EPSG", "4326", "name", "WGS 84"],
  ["coordinateSystem", "statePlane", "NAD83 / California zone 6", "EPSG", "2230", "units", "feet"]
]
```

### Example: Document with Location Reference

```json
"SpatialContext": [
  ["building", "name", "Headquarters", "code", "HQ-001"],
  ["level", "number", "3", "name", "Executive Floor"],
  ["room", "number", "301", "name", "CEO Office"]
]
```

### Python Code: SpatialContext Construction

```python
def build_spatial_context(
    room: dict | None = None,
    level: dict | None = None,
    building: dict | None = None,
    site: dict | None = None,
    coordinate_system: dict | None = None
) -> list:
    """
    Build a SpatialContext array from spatial metadata.
    
    Each parameter is a dict of key-value pairs for that context level.
    
    Example:
        build_spatial_context(
            room={"number": "101", "name": "Conference Room", "roomGUID": "abc-123"},
            level={"number": "1", "name": "Ground Floor"},
            building={"name": "Tower A", "code": "TWR-A"}
        )
    """
    spatial_context = []
    
    def dict_to_array(context_type: str, data: dict) -> list:
        result = [context_type]
        for key, value in data.items():
            result.extend([key, str(value)])
        return result
    
    if room:
        spatial_context.append(dict_to_array("room", room))
    if level:
        spatial_context.append(dict_to_array("level", level))
    if building:
        spatial_context.append(dict_to_array("building", building))
    if site:
        spatial_context.append(dict_to_array("site", site))
    if coordinate_system:
        spatial_context.append(dict_to_array("coordinateSystem", coordinate_system))
    
    return spatial_context

# Example usage:
spatial = build_spatial_context(
    room={"number": "101", "name": "Conference Room A", "roomGUID": "abc-123"},
    level={"number": "1", "name": "Ground Floor", "elevation": "0.0"},
    building={"name": "Tower A", "buildingGUID": "def-456"},
    coordinate_system={"EPSG": "4326"}
)
# Result: [
#   ["room", "number", "101", "name", "Conference Room A", "roomGUID", "abc-123"],
#   ["level", "number", "1", "name", "Ground Floor", "elevation", "0.0"],
#   ["building", "name", "Tower A", "buildingGUID", "def-456"],
#   ["coordinateSystem", "EPSG", "4326"]
# ]
```

---

## 7. GraphSequence and Context Graphs

Strange Matter implements a **context graph** pattern - capturing not just data, but the relationships and temporal ordering between components. This enables queryable decision lineage and precedent tracking.

### The Context Graph Concept

Traditional systems store *what* happened. Context graphs store *how things relate* and *when they were added*. When an agent needs to understand why a decision was made or find precedent for a similar situation, the context graph provides that lineage.

> **Reference:** [Context Graphs: AI's Trillion-Dollar Opportunity](https://foundationcapital.com/context-graphs-ais-trillion-dollar-opportunity/) - Foundation Capital describes context graphs as "a living record of decision traces stitched across entities and time so precedent becomes searchable."

Strange Matter's `GraphSequence` field implements this pattern at the component level.

### Format

```
GraphID:DateTime
```

| Part | Format | Description |
|------|--------|-------------|
| GraphID | UUID v7 | Unique identifier for the context graph |
| DateTime | ISO 8601 | When component was added to the graph (e.g., `2025-01-15T10:30:00Z`) |

### Why DateTime Instead of Sequence Numbers?

In a distributed system, components are created independently across different tools, users, and locations. **You cannot assume knowledge of all other components in a graph to assign a running sequence number.**

Using datetime:
- **Self-contained**: Each component knows its own join time
- **No coordination required**: No central authority needed to track sequences
- **Sortable**: ISO 8601 datetimes sort correctly as strings
- **Precise**: Millisecond precision available when needed

### Key Rules

1. **Every component belongs to at least one graph**
2. **A component can belong to multiple graphs** (array of entries)
3. **GraphID is generated once per context** (project, thread, workflow)
4. **DateTime is when the component was added to that graph**

### When to Generate a New GraphID

| Situation | Action |
|-----------|--------|
| New project started | Generate new GraphID, use current datetime |
| New document added to existing project | Use project's GraphID, use current datetime |
| Component reused in another project | Add second entry with new project's GraphID and current datetime |
| New email thread | Generate new GraphID for the thread |
| Reply to existing email thread | Use thread's GraphID, use email datetime |

### Example Scenarios

**Scenario 1: Building a project graph**

```
Component 1: Project definition (created 10:30)
  GraphSequence: ["019432a1-7b2c-7def-8abc-1234567890ab:2025-01-15T10:30:00Z"]

Component 2: Client program document (created 14:00)
  GraphSequence: ["019432a1-7b2c-7def-8abc-1234567890ab:2025-01-15T14:00:00Z"]

Component 3: Site survey (created next day)
  GraphSequence: ["019432a1-7b2c-7def-8abc-1234567890ab:2025-01-16T09:15:00Z"]
```

**Scenario 2: Component shared across projects**

A "Standard Conference Room" space type used on two projects:

```json
"GraphSequence": [
  "019432a1-7b2c-7def-8abc-1234567890ab:2025-01-15T10:30:00Z",
  "019543b2-8c3d-8ef0-9bcd-2345678901bc:2025-01-20T14:45:00Z"
]
```

This component:
- Was added to Project A's graph on January 15
- Was reused in Project B's graph on January 20

**Scenario 3: Decision trace graph**

An approval workflow where each step is a component:

```
Request submitted    → Graph X:2025-01-15T09:00:00Z
Manager review       → Graph X:2025-01-15T11:30:00Z
Exception requested  → Graph X:2025-01-15T14:00:00Z
VP approval          → Graph X:2025-01-16T10:00:00Z
Final decision       → Graph X:2025-01-16T15:30:00Z
```

Now you can query: "Show me all components in Graph X ordered by datetime" to replay the decision.

### Python Code: GraphSequence Management

```python
import uuid
from datetime import datetime, timezone

def create_graph_id() -> str:
    """Create a new context graph and return its ID."""
    return str(uuid.uuid7())

def add_to_graph(graph_id: str, timestamp: datetime | None = None) -> str:
    """
    Create a graph membership entry for a component.
    
    Args:
        graph_id: The UUID v7 of the graph
        timestamp: When added to graph (defaults to now)
    
    Returns:
        GraphSequence entry string: "GraphID:DateTime"
    """
    if timestamp is None:
        timestamp = datetime.now(timezone.utc)
    
    # Format datetime as ISO 8601 with Z suffix
    dt_str = timestamp.isoformat().replace('+00:00', 'Z')
    
    return f"{graph_id}:{dt_str}"

# Example usage:

# Start a new project
project_graph = create_graph_id()
project_component = add_to_graph(project_graph)
# Result: "019432a1-7b2c-7def-8abc-1234567890ab:2025-01-15T10:30:00Z"

# Add program document to same project (a few hours later)
program_component = add_to_graph(project_graph)
# Result: "019432a1-7b2c-7def-8abc-1234567890ab:2025-01-15T14:00:00Z"

# Space type used in this project AND another project
other_project_graph = "019543b2-8c3d-8ef0-9bcd-2345678901bc"
space_type_memberships = [
    add_to_graph(project_graph),       # When added to this project
    add_to_graph(other_project_graph)  # When reused in other project
]
```

### Querying Context Graphs

The context graph enables powerful queries:

| Query | How |
|-------|-----|
| "Show all components in Project X" | Filter by GraphID |
| "Show components in order added" | Sort by DateTime |
| "What other projects use this component?" | Check for multiple GraphSequence entries |
| "What was added after the program?" | Filter GraphID, datetime > program's datetime |
| "Replay decision workflow" | Get all components with same GraphID, sort by datetime |

---

## 8. Tags, Status, and License

### Tags

Freeform labels for categorization and search. Unlike `ComponentClassification` (structured), tags are flexible.

```json
"Tags": ["sustainable", "LEED-gold", "renovation", "historic", "client-priority"]
```

**Best Practices:**
- Use lowercase, hyphenated tags for consistency
- Include project-specific, client-specific, and domain tags
- Common architectural tags: `renovation`, `new-construction`, `historic`, `accessible`, `sustainable`

### Status

Lifecycle state of the component. Includes expiration concepts.

| Status | When to Use |
|--------|-------------|
| `draft` | Work in progress, not ready for use |
| `active` | Current, valid, in use |
| `pending_review` | Awaiting review or approval |
| `approved` | Formally approved by stakeholder |
| `issued` | Officially issued (e.g., for construction) |
| `superseded` | Replaced by newer version |
| `expired` | No longer valid due to time constraints |
| `archived` | Retained for reference, not active |
| `deprecated` | Should not be used, may be removed |

**Example Status Transitions:**
```
draft → pending_review → approved → issued → superseded → archived
                                          ↘ expired (if time-based)
```

### License

Rights and redistribution permissions. Required when components cross organizational boundaries.

```json
"License": {
  "type": "proprietary",
  "attribution": "Acme Architecture LLC",
  "canRedistribute": false,
  "canModify": true,
  "expiresAt": "2026-01-01T00:00:00Z"
}
```

| License Type | Typical Use |
|--------------|-------------|
| `proprietary` | Client work, internal data |
| `cc-by` | Shareable with attribution |
| `cc0` | Public domain |
| `mit`, `apache-2.0` | Open source compatible |

---

## 9. PayloadHash Calculation

The `PayloadHash` is an MD5 hash of the **serialized Payload only** (not the entire component).

### Critical Rules
1. Serialize with consistent formatting: no extra whitespace, sorted keys
2. Hash the serialized string, not the object
3. Use lowercase hexadecimal output

### Python Code: PayloadHash Calculation

```python
import hashlib
import json

def compute_payload_hash(payload: list | None) -> str:
    """
    Compute MD5 hash of the serialized payload.
    
    Args:
        payload: The Payload array (or None)
    
    Returns:
        Lowercase hexadecimal MD5 hash string
    """
    if payload is None:
        payload = []
    
    # Serialize with consistent formatting
    # - separators=(',', ':') removes extra spaces
    # - sort_keys=True ensures consistent ordering
    payload_json = json.dumps(payload, separators=(',', ':'), sort_keys=True)
    
    # Compute MD5 hash
    return hashlib.md5(payload_json.encode('utf-8')).hexdigest()

# Example usage:
payload = [
    {
        "type": "Feature",
        "geometry": {"type": "Polygon", "coordinates": [[[0,0], [1,0], [1,1], [0,1], [0,0]]]},
        "properties": {"name": "Building A"}
    }
]

payload_hash = compute_payload_hash(payload)
# Result: '3a7b9c2d1e4f5a6b7c8d9e0f1a2b3c4d' (example)
```

---

## 10. AI Section: Embeddings, Confidence, and Generation Metadata

The `AI` object comes after `Payload` and contains vector embeddings for similarity search, confidence scores, and AI generation metadata.

### Why This Matters

Strange Matter is designed for storage in vector-capable formats like [Lance](https://github.com/lance-format/lance). The `AI.Embeddings` field enables:

- **Semantic search**: Find similar components by meaning, not just keywords
- **Multi-modal search**: Embed text descriptions AND geometry separately
- **Hybrid queries**: Combine vector similarity with SQL filters (e.g., "find building footprints similar to this one, in Project X")

### Embeddings Structure

Each embedding must specify:
- **What** was embedded (`source`)
- **How** it was embedded (`model`, `provider`, `dimensions`)
- **The vector** itself

```json
"AI": {
  "Embeddings": [
    {
      "id": "emb-text-001",
      "model": "text-embedding-3-large",
      "provider": "openai",
      "dimensions": 3072,
      "source": "name+payload.properties.description",
      "sourceHash": "md5:abc123def456",
      "createdAt": "2025-01-15T10:30:00Z",
      "vector": [0.123, -0.456, 0.789, ...]
    },
    {
      "id": "emb-geo-001",
      "model": "geospatial-encoder-v2",
      "provider": "internal",
      "dimensions": 256,
      "source": "payload.geometry",
      "createdAt": "2025-01-15T10:30:00Z",
      "vector": [0.111, -0.222, ...]
    }
  ]
}
```

### Source Field Values

| Source | What Gets Embedded |
|--------|-------------------|
| `name` | Just the Name field |
| `payload` | Serialized payload |
| `name+payload` | Concatenated name and payload |
| `payload.geometry` | Just the geometry portion |
| `payload.properties.description` | Specific nested field |
| `name+tags+classification` | Combined metadata |

### Confidence Structure

For AI-generated or AI-extracted components:

```json
"Confidence": {
  "score": 0.92,
  "source": "gpt-4o-extraction-pipeline",
  "flags": ["ai-extracted", "needs-review"],
  "assessedAt": "2025-01-15T10:30:00Z"
}
```

**Common Flags:**
- `ai-generated`: Created by AI, not human
- `ai-extracted`: Extracted from documents by AI
- `human-verified`: Reviewed and confirmed by human
- `needs-review`: Flagged for human review
- `low-quality-source`: Source data was poor quality

### GeneratedBy Structure

If the component was AI-generated:

```json
"GeneratedBy": {
  "model": "gpt-4o",
  "provider": "openai",
  "prompt": "Extract floor plan data from the attached PDF...",
  "generatedAt": "2025-01-15T10:30:00Z"
}
```

### Python Code: Embedding Generation

```python
import hashlib
import json
from datetime import datetime, timezone

def create_embedding_entry(
    content: str,
    source: str,
    model: str = "text-embedding-3-large",
    provider: str = "openai",
    dimensions: int = 3072,
    embed_function=None  # Your embedding API call
) -> dict:
    """
    Create an embedding entry for the AI.Embeddings array.
    """
    # Compute source hash to detect when re-embedding is needed
    source_hash = f"md5:{hashlib.md5(content.encode()).hexdigest()}"
    
    # Generate embedding (replace with your actual embedding call)
    if embed_function:
        vector = embed_function(content)
    else:
        vector = [0.0] * dimensions  # Placeholder
    
    return {
        "id": f"emb-{hashlib.md5(source.encode()).hexdigest()[:8]}",
        "model": model,
        "provider": provider,
        "dimensions": dimensions,
        "source": source,
        "sourceHash": source_hash,
        "createdAt": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        "vector": vector
    }
```

---

## 11. ComponentHash and ByteCount

These fields come at the very end of the component for integrity verification and size tracking.

### ComponentHash

A hash of the entire component (excluding `ComponentHash` and `ByteCount` themselves).

```json
"ComponentHash": "sha256:a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
```

**Format:** `algorithm:hexdigest`
- Supported algorithms: `sha256`, `sha512`, `md5`

### ByteCount

Size information for streaming, pagination, and storage planning:

```json
"ByteCount": {
  "header": 2048,
  "payload": 45230,
  "embeddings": 12288,
  "total": 59566
}
```

### Python Code: Hash and Size Calculation

```python
import hashlib
import json

def compute_component_hash(component: dict) -> str:
    """
    Compute SHA-256 hash of component, excluding ComponentHash and ByteCount.
    """
    # Create copy without hash/size fields
    hashable = {k: v for k, v in component.items() 
                if k not in ['ComponentHash', 'ByteCount']}
    
    # Serialize consistently
    serialized = json.dumps(hashable, separators=(',', ':'), sort_keys=True)
    
    return f"sha256:{hashlib.sha256(serialized.encode()).hexdigest()}"

def compute_byte_count(component: dict) -> dict:
    """
    Compute size of component parts in bytes.
    """
    # Separate parts
    payload = component.get('Payload', [])
    ai = component.get('AI', {})
    embeddings = ai.get('Embeddings', [])
    
    # Everything except payload and AI
    header = {k: v for k, v in component.items() 
              if k not in ['Payload', 'AI', 'ComponentHash', 'ByteCount']}
    
    header_bytes = len(json.dumps(header, separators=(',', ':')).encode())
    payload_bytes = len(json.dumps(payload, separators=(',', ':')).encode())
    embeddings_bytes = len(json.dumps(embeddings, separators=(',', ':')).encode())
    
    return {
        "header": header_bytes,
        "payload": payload_bytes,
        "embeddings": embeddings_bytes,
        "total": header_bytes + payload_bytes + embeddings_bytes
    }
```

---

## 12. UsedAsA Selection Guide

Choose the appropriate value based on how the component is being used:

| Value | When to Use | Example |
|-------|-------------|---------|
| **Instance** | A specific real-world occurrence | This particular building footprint, this email message |
| **Typical** | A reusable template instantiated multiple times | A standard door type, an email template |
| **Archetype** | A requirements/specification object, not holding actual data | Project requirements document, specification template |
| **Relationship** | Describes a connection between entities | "Building A contains Room 101" |
| **Group** | A logical grouping of components | All floors in a building |
| **Collection** | An ordered set of components | A sequence of meeting notes |

### Decision Tree

```
Is this a template/pattern that will be reused?
├── Yes → Is it a requirements/spec (no actual data)?
│         ├── Yes → Archetype
│         └── No → Typical
└── No → Does it describe a connection between things?
         ├── Yes → Relationship
         └── No → Is it a grouping of other components?
                  ├── Yes → Ordered? → Collection
                  │         └── Unordered? → Group
                  └── No → Instance
```

---

## 13. Extends Reference Format

The `Extends` array references other components this one builds upon.

### Prefix Meanings

| Prefix | Full Name | Meaning |
|--------|-----------|---------|
| `ACT` | Archetype | Extending a requirements/specification object |
| `TPC` | Typical | Extending a reusable template |
| `INT` | Interface | Extending an interface definition |
| `ENT` | Entity | Extending an entity |
| `COM` | Component | Extending another component |
| `VER` | Version | Extending a specific version |

### Formats

**Bare prefix** (simple extension):
```json
"Extends": ["TPC"]
```

**Full reference** (specific target):
```json
"Extends": ["TPC:DoorType-v1.2"]
```

**Combined prefixes** (multiple inheritance indicators):
```json
"Extends": ["ACT+TPC:ProjectRequirements:REQ-001"]
```

### Pattern
```
^(ACT|TPC|INT|ENT|COM|VER)(\+(ACT|TPC|INT|ENT|COM|VER))*:.+$
```

---

## 14. Action Encoding

Actions encode machine-readable operations this component performs.

### String Format
```
ACTION:TYPE:ID:PARAM1:VALUE1:PARAM2:VALUE2
```

### Predefined Actions

| Action | Meaning |
|--------|---------|
| `AGM` | Augment - add to existing |
| `OVR` | Override - replace existing |
| `MOD` | Modify - change existing |
| `RMV` | Remove - delete existing |
| `MOV` | Move - relocate existing |
| `ASSIGN` | Assign responsibility or ownership |

### String Format Example
```json
"Action": ["ASSIGN:TASK:T-001:assignee:john@acme.com"]
```

### Object Format (richer metadata)
```json
"Action": [
  {
    "action": "ASSIGN:TASK:T-001",
    "assignment": "john@acme.com",
    "dueDate": "2025-12-01T00:00:00Z"
  }
]
```

---

## 15. Validation Checklist

Before outputting a component, verify:

### Required Fields (19 total)
- [ ] `ComponentType` - string
- [ ] `SchemaVersion` - string matching `^[0-9]+\.[0-9]+$` (e.g., `"0.91"`)
- [ ] `ComponentInfo` - object with `version`, `author`, `sourceurl`, `publishdate` (all arrays)
- [ ] `DataAuthorIdentifier` - valid email format
- [ ] `Context` - URI with `?` and required query params (`projectName`, `projectNumber`)
- [ ] `GraphSequence` - array of strings, format `GraphID:DateTime` (e.g., `UUID7:2025-01-15T10:30:00Z`)
- [ ] `UsedAsA` - one of: `Instance`, `Typical`, `Archetype`, `Relationship`, `Group`, `Collection`
- [ ] `ComponentClassification` - string
- [ ] `Status` - one of: `draft`, `active`, `pending_review`, `approved`, `issued`, `superseded`, `expired`, `archived`, `deprecated`
- [ ] `EntityGUID` - string (source GUID or UUID v7)
- [ ] `ComponentGUID` - string (UUID v7)
- [ ] `ComponentVersionGUID` - string (UUID v7)
- [ ] `ForeignIDs` - object (can be empty `{}`)
- [ ] `DateCreated` - ISO 8601 datetime
- [ ] `LastModified` - ISO 8601 datetime
- [ ] `HashDefinition` - must be `"MD5"`
- [ ] `PayloadHash` - MD5 hash of serialized Payload
- [ ] `PayloadDataType` - one of: `json`, `geojson`
- [ ] `PayloadSchemaFormat` - one of: `json-schema`, `typescript`, `openapi`, `graphql`, `protobuf`, `avro`, `other`

### Optional but Recommended
- [ ] `SpatialContext` - array of arrays capturing spatial hierarchy
- [ ] `Tags` - array of freeform strings for categorization
- [ ] `License` - object with `type` (required), `attribution`, `canRedistribute`, `canModify`
- [ ] `AI.Embeddings` - array of embedding objects for similarity search
- [ ] `AI.Confidence` - confidence score and quality flags
- [ ] `ComponentHash` - SHA-256 hash of entire component for integrity
- [ ] `ByteCount` - size information for streaming

### Format Validations
- [ ] `Name` follows `<institution>_<format>_<datatype>` pattern
- [ ] `DataAuthorIdentifier` is valid email (contains `@`)
- [ ] `Context` contains `?` with `projectName` and `projectNumber` params
- [ ] `DateCreated` and `LastModified` are valid ISO 8601 (e.g., `2025-01-15T10:30:00Z`)
- [ ] `PayloadHash` matches computed MD5 of actual Payload
- [ ] `SpatialContext` inner arrays start with valid context type (`room`, `level`, `building`, `site`, `zone`, `area`, `coordinateSystem`)
- [ ] `GraphSequence` entries match pattern `^UUID7:ISO8601DateTime$`

### Consistency Checks
- [ ] If `PayloadDataType` is `geojson`, Payload should contain valid GeoJSON
- [ ] `ComponentInfo` arrays should have at least one element each
- [ ] `LastModified` should be >= `DateCreated`
- [ ] `SpatialContext` captures all available spatial identifiers (GUIDs, names, numbers)
- [ ] `GraphSequence` includes all graphs this component belongs to
- [ ] Datetime values are valid ISO 8601 format

---

## 16. Complete Worked Example

Creating an `Acme_geojson_polygon` component type for building footprints.

### Input Information
- Institution: Acme
- Format: geojson
- Data type: polygon
- Classification: building_footprint
- Author: jane.smith@acme.com
- Source: SharePoint site
- Project: Tower Project (P-2024-001)

### Generated Component

```json
{
  "ComponentType": "https://schemas.acme.com/strange-matter/v0.91/component-types",
  
  "SchemaVersion": "0.91",
  
  "ComponentInfo": {
    "version": ["1.0.0"],
    "author": ["jane.smith@acme.com"],
    "sourceurl": ["https://acme.sharepoint.com/sites/engineering/floorplans"],
    "publishdate": ["2025-01-15T10:30:00Z"]
  },
  
  "DataAuthorIdentifier": "jane.smith@acme.com",
  
  "Context": "https://acme.sharepoint.com/sites/engineering?projectName=Tower%20Project&projectNumber=P-2024-001&docType=floorplan",
  
  "SpatialContext": [
    ["room", "number", "G-101", "name", "Main Lobby", "roomGUID", "7d4947f4-8j2d-55h7-3e4g-4749h26g7745"],
    ["level", "number", "0", "name", "Ground Floor", "elevation", "0.0", "levelGUID", "4a2614f1-5g9a-22e4-0b1d-1416e93d4412"],
    ["building", "name", "Tower A", "code", "TWR-A", "buildingGUID", "5b3725g2-6h0b-33f5-1c2e-2527f04e5523"],
    ["site", "name", "Corporate Campus", "siteGUID", "6c4836h3-7i1c-44g6-2d3f-3638g15f6634"],
    ["coordinateSystem", "EPSG", "2230", "statePlane", "NAD83 / California zone 6", "units", "feet"]
  ],
  
  "GraphSequence": ["019432a1-7b2c-7def-8abc-1234567890ab:2025-01-15T10:30:00Z"],
  
  "UsedAsA": "Instance",
  
  "ComponentClassification": "building_footprint",
  
  "Tags": ["ground-floor", "main-entry", "public-space", "accessible"],
  
  "Status": "active",
  
  "License": {
    "type": "proprietary",
    "attribution": "Acme Architecture LLC",
    "canRedistribute": false,
    "canModify": true
  },
  
  "Extends": [],
  
  "Action": [],
  
  "EntityGUID": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  
  "ComponentGUID": "019432a1-7b2c-7def-8abc-1234567890ab",
  
  "ComponentVersionGUID": "019432a1-7b2c-7def-8abc-1234567890cd",
  
  "ForeignIDs": {
    "revit_element_id": "45678",
    "sharepoint_item_id": "abc-123-def",
    "building_code": "BLD-TOWER-001",
    "floor_name": "Ground Floor"
  },
  
  "DateCreated": "2025-01-15T10:30:00Z",
  
  "LastModified": "2025-01-15T10:30:00Z",
  
  "Name": "Acme_geojson_polygon",
  
  "HashDefinition": "MD5",
  
  "PayloadHash": "d41d8cd98f00b204e9800998ecf8427e",
  
  "PayloadDataType": "geojson",
  
  "PayloadSchemaFormat": "json-schema",
  
  "PayloadSchema": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "type": { "const": "Feature" },
      "geometry": {
        "type": "object",
        "properties": {
          "type": { "const": "Polygon" },
          "coordinates": { "type": "array" }
        },
        "required": ["type", "coordinates"]
      },
      "properties": { "type": "object" }
    },
    "required": ["type", "geometry"]
  },
  
  "Payload": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[0, 0], [100, 0], [100, 50], [0, 50], [0, 0]]]
      },
      "properties": {
        "name": "Tower A - Ground Floor",
        "area_sqft": 5000,
        "floor": 0
      }
    }
  ],
  
  "AI": {
    "Embeddings": [
      {
        "id": "emb-text-001",
        "model": "text-embedding-3-large",
        "provider": "openai",
        "dimensions": 3072,
        "source": "name+payload.properties.name",
        "sourceHash": "md5:a1b2c3d4e5f6",
        "createdAt": "2025-01-15T10:30:00Z",
        "vector": [0.123, -0.456, 0.789]
      }
    ],
    "Confidence": {
      "score": 0.98,
      "source": "revit-export-pipeline",
      "flags": ["source-verified"],
      "assessedAt": "2025-01-15T10:30:00Z"
    }
  },
  
  "ComponentHash": "sha256:a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
  
  "ByteCount": {
    "header": 2048,
    "payload": 512,
    "embeddings": 12288,
    "total": 14848
  }
}
```

### Field-by-Field Explanation

| Field | Value | Reasoning |
|-------|-------|-----------|
| `SchemaVersion` | `0.91` | Current Strange Matter schema version |
| `Name` | `Acme_geojson_polygon` | Follows `<institution>_<format>_<datatype>` pattern |
| `ComponentClassification` | `building_footprint` | Specific use case within polygon type |
| `Tags` | `["ground-floor", "accessible"]` | Freeform search/filter labels |
| `Status` | `active` | Current, valid component |
| `License` | `proprietary` | Client work, not redistributable |
| `EntityGUID` | `3f2504e0-...` | Used Revit's UniqueId (a real GUID from source) |
| `ComponentGUID` | `019432a1-...` | Generated UUID v7 (not in source data) |
| `ForeignIDs` | `{sharepoint_item_id, revit_element_id, building_code}` | All identifiers including human-readable `building_code` |
| `Context` | URL with `projectName` and `projectNumber` first | Web-hosted source, required params first |
| `SpatialContext` | Room → Level → Building → Site → Coordinate System | Full spatial hierarchy with all GUIDs and names preserved |
| `GraphSequence` | `["...ab:2025-01-15T10:30:00Z"]` | Added to this project's context graph on Jan 15 |
| `PayloadHash` | MD5 of serialized Payload | Computed after Payload was finalized |
| `UsedAsA` | `Instance` | This is a specific building, not a template |
| `AI.Embeddings` | Text embedding of name + description | Enables semantic search in Lance |
| `AI.Confidence` | 0.98 from Revit pipeline | High confidence, source-verified |
| `ComponentHash` | SHA-256 of full component | Integrity verification |
| `ByteCount` | 14,848 total bytes | Size tracking for streaming |

---

## 17. Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|------------------|
| Using a name/title as EntityGUID | EntityGUID must be a real GUID, MessageID, or hash—not fragile identifiers |
| Generating UUID v7 when source has a real GUID | Check for source GUIDs first (Revit UniqueId, database UUID, MessageID) |
| Not capturing names/codes in ForeignIDs | ALL source identifiers go in ForeignIDs, even if one is used as EntityGUID |
| Putting random query params before projectName/projectNumber | Required params always first in Context URI |
| Hashing the entire component instead of just Payload | Only hash the serialized Payload array |
| Using `AuthorIdentifier` instead of `DataAuthorIdentifier` | Field name is `DataAuthorIdentifier` |
| Forgetting that ComponentInfo fields are arrays | All four sub-fields must be arrays, even with one value |
| Creating vague type names like `Acme_data_json` | Be specific: `Acme_json_email`, `Acme_geojson_polygon` |
| Omitting SpatialContext when spatial data is available | Capture room, level, building, coordinate system—metadata preserves context across systems |
| Only capturing one identifier per spatial level | Include ALL identifiers (GUIDs, names, numbers) for each spatial level |
| Using integer or sequence number for GraphSequence | Must be array of `"GraphID:DateTime"` strings |
| Generating new GraphID for every component | Reuse GraphID for components in the same context (project, thread, workflow) |
| Forgetting multi-graph membership | If component is reused across projects, include entries for ALL graphs it belongs to |
| Using sequence numbers instead of datetime | GraphSequence uses datetime for distributed systems - no central coordination needed |
| Omitting `SchemaVersion` | Required field - always include (e.g., `"0.91"`) |
| Omitting `Status` | Required field - use `"active"` for current, valid components |
| Not including `Tags` for searchability | Tags enable flexible filtering beyond structured `ComponentClassification` |
| Embedding without specifying `source` | Always indicate what was embedded: `payload`, `name+payload`, etc. |
| Forgetting `sourceHash` in embeddings | Include hash to detect when content changes and re-embedding is needed |
| Omitting `ComponentHash` when transferring | Include for integrity verification when components move between systems |

---

## 18. Quick Reference: Minimum Valid Component

```python
import uuid
import hashlib
import json
from datetime import datetime, timezone

def create_minimum_component(
    institution: str,
    format: str,
    datatype: str,
    classification: str,
    author_email: str,
    context_base: str,
    project_name: str,
    project_number: str,
    source_guid: str | None = None,
    source_identifiers: dict | None = None,
    spatial_context: list | None = None,
    graph_sequence: list | None = None,
    payload: list | None = None
) -> dict:
    """
    Create a minimum valid Strange Matter component.
    
    Args:
        source_guid: A real GUID/UUID from source (Revit UniqueId, DB UUID, MessageID, file hash).
                     NOT a name or human-readable code. If None, UUID v7 is generated.
        source_identifiers: Dict of ALL source identifiers (names, codes, other IDs) for ForeignIDs.
        spatial_context: List of spatial context arrays, e.g.:
                         [["room", "number", "101", "name", "Lobby"],
                          ["level", "number", "1", "name", "Ground Floor"]]
        graph_sequence: List of graph memberships, e.g.:
                        ["019432a1-7b2c-7def-8abc-1234567890ab:000000001"]
                        If None, creates a new graph with sequence 000000001.
    """
    
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    payload = payload or []
    
    # Compute payload hash
    payload_json = json.dumps(payload, separators=(',', ':'), sort_keys=True)
    payload_hash = hashlib.md5(payload_json.encode('utf-8')).hexdigest()
    
    # EntityGUID must be a real GUID - generate if not provided
    entity_guid = source_guid if source_guid else str(uuid.uuid7())
    
    return {
        "ComponentType": f"https://schemas.{institution.lower()}.com/strange-matter/v0.91",
        "ComponentInfo": {
            "version": ["1.0.0"],
            "author": [author_email],
            "sourceurl": [context_base],
            "publishdate": [now]
        },
        "DataAuthorIdentifier": author_email,
        "Context": f"{context_base}?projectName={project_name}&projectNumber={project_number}",
        "SpatialContext": spatial_context or [],
        "GraphSequence": graph_sequence or [f"{str(uuid.uuid7())}:{now}"],
        "UsedAsA": "Instance",
        "ComponentClassification": classification,
        "Extends": [],
        "Action": [],
        "EntityGUID": entity_guid,
        "ComponentGUID": str(uuid.uuid7()),
        "ComponentVersionGUID": str(uuid.uuid7()),
        "ForeignIDs": source_identifiers or {},
        "DateCreated": now,
        "LastModified": now,
        "Name": f"{institution}_{format}_{datatype}",
        "HashDefinition": "MD5",
        "PayloadHash": payload_hash,
        "PayloadDataType": format,
        "PayloadSchemaFormat": "json-schema",
        "PayloadSchema": {},
        "Payload": payload
    }
```

---

*This guide accompanies the [Component Schema Documentation](component-documentation.md) and [component.json](component.json) schema file.*

