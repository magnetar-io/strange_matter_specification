# Strange Matter Component Schema Documentation

## Overview

**Title:** Component  
**Version:** 0.91  
**Date:** 2025-09-07  
**Description:** Schema for Strange Matter Component specification defining the structure and metadata for components in the Strange Matter ecosystem

## Schema Properties

### ComponentType
- **Type:** string
- **Pattern:** (empty - to be defined)
- **Description:** A URI that hosts the component definitions for things like Enums of ComponentClassification, Payloads Etc. This Mockup is in JSON Schema, but it could be any valid choice for definitions

### SchemaVersion
- **Type:** string
- **Pattern:** `^[0-9]+\\.[0-9]+$`
- **Description:** Version of the Strange Matter component schema this component conforms to. Enables forward compatibility as the schema evolves.
- **Example:** `"0.91"`

### ComponentInfo
- **Type:** object
- **Description:** Information about the component including version, author, and source URL details

#### ComponentInfo Properties

##### version
- **Type:** array of strings
- **Description:** Array of version identifiers for the component

##### author
- **Type:** array of strings
- **Description:** Array of author identifiers for the component

##### sourceurl
- **Type:** array of strings (URI format)
- **Description:** Array of source URLs where the component can be found

##### publishdate
- **Type:** array of strings (date-time format)
- **Description:** Array of publish dates for the component versions in ISO 8601 format

### DataAuthorIdentifier
- **Type:** string (email format)
- **Description:** The email address of the author of the component

### Context
- **Type:** string (URI format)
- **Pattern:** `^.+\\?.*$`
- **Description:** A parameterized URI that identifies the specific project context and dataset origin where this component was created. The URI includes query parameters for project identification, source tracking, version information, and spatial context with both human-readable names and EntityGUIDs for precise location referencing.

### SpatialContext
- **Type:** array of arrays
- **Description:** Hierarchical spatial context information that preserves location metadata when data moves between systems. Each inner array represents one spatial context level (room, level, building, coordinate system, etc.) with associated identifiers.

#### SpatialContext Structure
Each inner array follows the format: `[contextType, key1, value1, key2, value2, ...]`

**Context Types:**
- `room` - Room-level spatial context (room number, name, GUIDs)
- `level` - Floor/story level (level number, name, elevation)
- `building` - Building identification
- `site` - Site/campus level
- `zone` - Zoning or area classification
- `area` - Named area within a space
- `coordinateSystem` - Geospatial reference system (EPSG, State Plane)

**Example:**
```json
"SpatialContext": [
  ["room", "number", "101", "name", "Conference Room A", "roomGUID", "abc-123-def"],
  ["level", "number", "1", "name", "Ground Floor", "elevation", "0.0", "levelGUID", "def-456-ghi"],
  ["building", "name", "Tower A", "code", "TWR-A", "buildingGUID", "ghi-789-jkl"],
  ["coordinateSystem", "EPSG", "4326", "statePlane", "NAD83 / California zone 6"]
]
```

### GraphSequenceNumber
- **Type:** array of strings
- **Pattern:** `^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}:[0-9]{9}$`
- **Description:** Array of graph memberships that track which **context graphs** this component belongs to and its sequential order within each graph. This enables queryable decision lineage and precedent tracking across systems.

#### Context Graph Concept

Strange Matter implements a **context graph** pattern - an emerging approach to capturing not just *what* data exists, but *how it relates* and *in what order it was added*. This creates a queryable record of decision traces, entity relationships, and temporal ordering that persists across system boundaries.

Reference: [Context Graphs: AI's Trillion-Dollar Opportunity](https://foundationcapital.com/context-graphs-ais-trillion-dollar-opportunity/) - Foundation Capital

#### Format

Each entry follows the pattern: `GraphID:SequenceNumber`

- **GraphID**: A UUID v7 identifying the context graph
- **SequenceNumber**: A 9-digit zero-padded integer indicating order within that graph

#### Key Behaviors

1. **Multi-graph membership**: A single component can belong to multiple graphs. Example: A "conference room" space type used on Project A and Project B belongs to both project graphs.

2. **Ordering within graphs**: The sequence number shows when a component was added relative to others in the same graph, enabling chronological queries.

3. **Graph creation**: The first component in a new context (e.g., a new project) generates a new GraphID. Subsequent related components use the same GraphID with incrementing sequence numbers.

#### Example

```json
"GraphSequenceNumber": [
  "019432a1-7b2c-7def-8abc-1234567890ab:000000001",
  "019543b2-8c3d-8ef0-9bcd-2345678901bc:000000015"
]
```

This component belongs to two graphs:
- Graph `019432a1-...`: Added as the 1st component (possibly the project definition)
- Graph `019543b2-...`: Added as the 15th component (possibly reused from another project)

#### Use Cases

| Scenario | GraphID | SequenceNumber |
|----------|---------|----------------|
| New project created | Generate new UUID v7 | `000000001` |
| Client program added to project | Same as project | `000000002` |
| Floor plan added to project | Same as project | `000000003` |
| Space type reused from another project | Both project GraphIDs | Different sequence in each |
| Email thread about a decision | Thread gets its own GraphID | Emails sequenced by time |

### UsedAsA
- **Type:** string
- **Enum Values:**
  - Instance
  - Typical
  - Archetype
  - Relationship
  - Group
  - Collection
- **Description:** How the Component is being used. This should not be a Type, but use for indicating its use when comparing it to how other data uses it in the 'includes' value

### ComponentClassification
- **Type:** string
- **Pattern:** (empty - to be defined)
- **Description:** The specific use case or classification within a component type. For example, a component type of `Acme_geojson_polygon` might have classifications like `building_footprint`, `parcel_boundary`, or `zoning_area`. This allows a single type definition to serve multiple related use cases while maintaining type-level consistency.

### Tags
- **Type:** array of strings
- **Description:** Freeform tags for categorization, search, and filtering. Complements the structured `ComponentClassification` field with flexible, user-defined labels.
- **Example:** `["sustainable", "LEED-gold", "renovation", "historic", "client-priority"]`

### Status
- **Type:** string
- **Enum Values:**
  - `draft` - Work in progress, not yet ready for use
  - `active` - Current, valid, and in use
  - `pending_review` - Awaiting review or approval
  - `approved` - Formally approved
  - `issued` - Officially issued (e.g., for construction)
  - `superseded` - Replaced by a newer version
  - `expired` - No longer valid due to time constraints
  - `archived` - Retained for reference but not active
  - `deprecated` - Should not be used, may be removed
- **Description:** Lifecycle status of the component. Integrates TTL/expiration concepts—when data expires, its status changes to `expired`.

### License
- **Type:** object
- **Description:** Rights and licensing information for the component data. Important when components move between organizations.

#### License Properties

##### type (required)
- **Type:** string
- **Enum Values:** `proprietary`, `cc-by`, `cc-by-sa`, `cc-by-nc`, `cc0`, `mit`, `apache-2.0`, `other`

##### attribution
- **Type:** string
- **Description:** Required attribution text if applicable.

##### canRedistribute
- **Type:** boolean
- **Description:** Whether this data can be shared with third parties.

##### canModify
- **Type:** boolean
- **Description:** Whether this data can be modified.

##### expiresAt
- **Type:** string (date-time format)
- **Description:** When this license/data expires, if applicable.

### Extends
- **Type:** array of strings
- **Description:** To create a graph of data that the author potentially doesn't control, it's necessary to be able to reference other data. For validation and ease of traversal it needs to be expressive such that the IDs are prefixed with a 'how I'm extending' the component indicator. So by including an Archetype (ART), the author is saying I see this as a Requirement Object, not one that should hold any data, and that a Typical (TPC) entity is going to be extended multiple times Etc. They can be combined as needed as prefixes, but the general patterns should be Function, then IDs, include a version. Foreign model references include both human-readable names and EntityGUIDs for precise linking.

#### Extends Items
- **Type:** string
- **OneOf Options:**
  1. **Bare Prefix:** One of `ACT`, `TPC`, `INT`, `ENT`, `COM`, `VER`
  2. **Full Reference:** Pattern `^(ACT|TPC|INT|ENT|COM|VER)(\\+(ACT|TPC|INT|ENT|COM|VER))*:.+$`
     - Examples: `TPC:DoorType-v1.2`, `ACT+TPC:ProjectRequirements:REQ-001`
- **Prefix Meanings:**
  - ACT: Archetype (requirements/specification object)
  - TPC: Typical (reusable template)
  - INT: Interface
  - ENT: Entity
  - COM: Component
  - VER: Version

### Action
- **Type:** array
- **Description:** Actions that this component performs on other components or entities. Actions are encoded in the data to make changes machine readable and executable. The format is ACTION:TYPE:ID:PARAM1:VALUE1:PARAM2:VALUE2 where ACTION is the operation, TYPE is the target type, ID is the target identifier, and additional parameters can be included as key-value pairs. Predefined actions: AGM (Augment - add to existing), OVR (Override - replace existing), MOD (Modify - change existing), RMV (Remove - delete existing), MOV (Move - relocate existing), ASSIGN (Assign - assign responsibility or ownership). Custom actions can be defined beyond the predefined set.

#### Action Items
- **Type:** string or object
- **OneOf Options:**
  1. **String Format:** string with pattern (empty - to be defined) - Traditional string-based action format
  2. **Object Format:** object with the following properties:
     - **action** (required): string with pattern (empty - to be defined) - The action to perform
     - **assignment** (optional): string - Assignment information for the action
     - **dueDate** (optional): string (date-time format) - Due date for the action in ISO 8601 format

### EntityGUID
- **Type:** string
- **Pattern:** (empty - to be defined)

### ComponentGUID
- **Type:** string
- **Pattern:** (empty - to be defined)

### ComponentVersionGUID
- **Type:** string
- **Pattern:** (empty - to be defined)

### ForeignIDs
- **Type:** object
- **Description:** Key-value pairs of foreign identifiers that reference this component in external systems or databases
- **Additional Properties:** string

### DateCreated
- **Type:** string (date-time format)
- **Description:** The creation date and time in ISO 8601 format.

### LastModified
- **Type:** string (date-time format)
- **Description:** The date and time the component was last modified, in ISO 8601 format.

### Name
- **Type:** string

### HashDefinition
- **Type:** string
- **Enum Values:**
  - MD5

### PayloadHash
- **Type:** string
- **Pattern:** (empty - to be defined)

### PayloadDataType
- **Type:** string
- **Description:** The data type of the payload.
- **Enum Values:**
  - json
  - geojson

### PayloadSchemaFormat
- **Type:** string
- **Description:** The format/encoding type of the PayloadSchema. Indicates how the schema is defined.
- **Enum Values:**
  - json-schema
  - typescript
  - openapi
  - graphql
  - protobuf
  - avro
  - other

### PayloadSchema
- **Description:** The schema definition for the payload. Can be either a URI reference to an external schema or an inline schema object. The format is indicated by the PayloadSchemaFormat field.
- **OneOf Options:**
  1. **URI Reference:** string with URI format - URI reference to an external schema definition
  2. **Inline Object:** object - Inline schema object defining the payload structure
  3. **Inline String:** string - Inline schema definition as a string

### Payload
- **Type:** array or null
- **Items:** object

### AI
- **Type:** object
- **Description:** AI-related metadata including embeddings and confidence scores. Designed for optimal storage in vector-capable formats like [Lance](https://github.com/lance-format/lance).

#### AI.Embeddings
- **Type:** array of embedding objects
- **Description:** Vector embeddings for similarity search. Multiple embeddings can be stored from different models or for different content sources.

Each embedding object contains:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | No | Unique identifier for this embedding within the component |
| `model` | string | Yes | The embedding model used (e.g., `text-embedding-3-large`) |
| `provider` | string | No | Provider of the model (e.g., `openai`, `cohere`, `local`) |
| `dimensions` | integer | Yes | Number of dimensions in the vector |
| `source` | string | Yes | What was embedded: `payload`, `name`, `name+payload`, `payload.geometry`, etc. |
| `sourceHash` | string | No | Hash of source content to detect when re-embedding is needed |
| `createdAt` | date-time | No | When this embedding was generated |
| `vector` | array of numbers | Yes | The embedding vector |

**Example:**
```json
"Embeddings": [
  {
    "id": "emb-001",
    "model": "text-embedding-3-large",
    "provider": "openai",
    "dimensions": 3072,
    "source": "name+payload",
    "sourceHash": "md5:abc123...",
    "createdAt": "2025-01-15T10:30:00Z",
    "vector": [0.123, -0.456, 0.789, ...]
  }
]
```

#### AI.Confidence
- **Type:** object
- **Description:** Confidence and quality scores for AI-generated or AI-processed components.

| Property | Type | Description |
|----------|------|-------------|
| `score` | number (0-1) | Overall confidence score |
| `source` | string | What generated this score (e.g., `gpt-4o`, `human-review`) |
| `flags` | array of strings | Quality flags: `ai-generated`, `ai-extracted`, `human-verified`, `needs-review`, `low-quality-source` |
| `assessedAt` | date-time | When confidence was assessed |

#### AI.GeneratedBy
- **Type:** object
- **Description:** If this component was AI-generated, information about the generation.

| Property | Type | Description |
|----------|------|-------------|
| `model` | string | The model that generated this component |
| `provider` | string | Model provider |
| `prompt` | string | The prompt or instruction used (optional) |
| `generatedAt` | date-time | When generation occurred |

### ComponentHash
- **Type:** string
- **Pattern:** `^(sha256|sha512|md5):[a-f0-9]+$`
- **Description:** Hash of the entire component (excluding this field and ByteCount) for integrity verification when components move between systems.
- **Example:** `"sha256:a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"`

### ByteCount
- **Type:** object
- **Description:** Size information for the component. Useful for streaming, pagination, and storage planning.

| Property | Type | Description |
|----------|------|-------------|
| `header` | integer | Size of header/metadata portion in bytes |
| `payload` | integer | Size of payload in bytes |
| `embeddings` | integer | Size of all embeddings in bytes |
| `total` | integer | Total component size in bytes |

## Strange Matter as Protocol

Strange Matter is a **protocol specification**, not just a serialization format. When stored in different systems, data is serialized optimally for each backend:

| Storage Backend | How Payload is Stored | How Embeddings are Stored |
|-----------------|----------------------|---------------------------|
| **Lance** | Columnar format optimized for analytics | Native vector columns with ANN indexing |
| **PostGIS** | Native geometry types per PostGIS spec | Separate vector extension or table |
| **MongoDB** | BSON documents | Atlas Vector Search columns |
| **JSON files** | Serialized JSON | Inline arrays |
| **Parquet** | Columnar with nested structures | Float arrays |

The schema defines the contract; storage backends handle optimal serialization.

## Required Fields

The following fields are required in all component instances (19 total):

- ComponentType
- SchemaVersion
- ComponentInfo
- DataAuthorIdentifier
- Context
- GraphSequenceNumber
- UsedAsA
- ComponentClassification
- Status
- EntityGUID
- ComponentGUID
- ComponentVersionGUID
- ForeignIDs
- DateCreated
- LastModified
- HashDefinition
- PayloadHash
- PayloadDataType
- PayloadSchemaFormat

## Notes

- All GUID fields (EntityGUID, ComponentGUID, ComponentVersionGUID) currently have empty pattern definitions that should be populated with appropriate regex patterns for GUID validation.
- The Action field supports both string-based and object-based formats for encoding machine-readable actions with predefined action types (AGM, OVR, MOD, RMV, MOV, ASSIGN) and custom actions. The object format allows for additional metadata like assignment and due date.
- The Extends field uses prefixes to indicate how components are being extended (ACT, TPC, INT, ENT, COM, VER).
- The Context field requires a parameterized URI with query parameters for project identification and spatial context.
- The GraphSequenceNumber field provides ordering for components within graph structures.
