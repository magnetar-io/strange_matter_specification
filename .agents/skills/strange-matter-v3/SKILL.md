---
name: strange-matter-v3
description: Design and implement Strange Matter V3 component types and instances from the repository schemas, preserving header-first discovery and reusable component boundaries. Use for new type decisions, producers, consumers, examples, and migrations; exclude earlier versions.
---

# Strange Matter V3 design and implementation

The common header contract is `Component_Schema/v3/Header_Schema/component_v3.json`. Read it and the applicable component type schema before implementing a producer, consumer, validator, example, or migration. The header document version is 3.04 and its dialect is JSON Schema Draft 2020-12. Use the schemas' `required` lists, types, formats, and constraints as written; this guide explains intent and does not add hidden validation rules.

## Why the boundaries matter

Strange Matter lets different people and tools add data about the same thing without owning one monolithic file or forcing every payload into one format. The **entity** is that shared thing; each **component** is an independently authored contribution. The header lets a consumer find the right contribution before decoding its payload.

- **Identify before opening:** `ComponentType`, `KomponentClassfication`, `PayloadDataType`, and relevant header context must say what the data is, why it exists, where it came from, and whether it is the data a consumer needs. Do not make an agent inspect `Payload` to discover those facts. The payload carries values and value-level context such as units and coordinate system.
- **Type names a reusable payload contract:** choose a stable, publisher-qualified `ComponentType` for data that has the same structure and meaning across uses. Do not make a new type for each project, view name, classification, or file extension. Create a more specific type when the payload contract genuinely differs and a shared schema would no longer be useful.
- **Classification names the actual representation:** `KomponentClassfication` says how a component of that type is being used. A view geometry component can be classified as `floor plan orthographic` or `structural ceiling plan orthographic`. The full name belongs in the header, even when the payload's numeric shape is the same. This permits view-first discovery and selection without opening the geometry.
- **Keep one subject across representations:** geometry sent to Revit and graphics produced from it can be separate components on the same view entity. They share `EntityGUID` but have different `ComponentGUID`s and type schemas. Use `StrangeMatter.View.Geometry` for the input geometry; reserve `StrangeMatter.View.Graphics` for PNG or PDF view output when its contract is defined. `PayloadDataType` distinguishes the output formats. A separate metadata type can be defined when needed. Do not create all these types speculatively.
- **Preserve ownership and provenance:** another author can add a component without overwriting the original. `Extends` targets an entity, not a particular component version; an exact geometry-to-graphics derivation needs a separate version-level relationship. `ForeignIDs` maps identifiers assigned by outside systems such as Revit; it is not a derivation link.

## Define types as needed

Create a component type schema **when a real workflow needs it**, before generating its instances. Do not build a speculative catalog of every possible component. First decide the entity, the independently useful data contribution, the reusable payload contract, and the header facts needed to find it. When the payload contract is uncertain, resolve it with the author before inventing fields.

Save Strange Matter-published type schemas under the appropriate category in `Component_Schema/v3/Component_Types/StrangeMatter/`; the [category guide](../../../Component_Schema/v3/Component_Types/StrangeMatter/README.md) gives the provisional homes. Do not add other publishers' type schemas here. Compose each type schema with the common header using a relative `$ref` calculated from that file's directory; constrain `ComponentType`, the type-specific `SchemaVersion`, `PayloadDataType`, relevant classification, and its payload values. Keep common identity and context definitions in the header schema. Validate instances against the type schema, which also applies the common header.

The existing `Component_Schema/v3/Component_Types/StrangeMatter/Views/StrangeMatter.View.Geometry.schema.json` illustrates the current boundary. Version 1.0 requires `KomponentClassfication.object: "view"` and a named representation ending in `orthographic`; the payload holds extent values with units and coordinate system. Its generic type name permits later projection branches, but the current version does not accept perspective representations. Adding one requires an explicit type-schema revision and consumer compatibility review.

## Other header decisions

`SchemaVersion` identifies the schema governing this component's data and need not equal the common header document's `version`. `AuthorIdentifier` currently accepts an email address for the creator. `Status` describes data lifecycle, not schema lifecycle. Keep the exact `KomponentClassfication` spelling used by V3.04.

`UsedAsA` gives the component's role. An `Instance` can use a reusable, unplaced `Typical`; an `Archetype` describes expected components. A `Relationship` connects data. A `Group` can assert a shared property about members; a `Collection` can gather members without that assertion. The role alone does not define a full inheritance or scene-graph protocol.

## Identity and references

`EntityGUID` identifies the subject across its components. `ComponentGUID` identifies the component across versions. `ComponentVersionGUID` identifies one version of that component. Generate all three as UUIDv7; preserve the entity and component identifiers as their corresponding identities persist. `ForeignIDs` is a map from an external system name to an array of that system's identifier strings. External IDs do not have to be UUIDv7.

`Extends` is an optional array of other entities' `EntityGUID` values. Use it when a producer adds its own Typical, Archetype, issue, or other information to another entity. A meeting component can also reference the `EntityGUID` of a series collection here, expressing membership without changing that collection's data. All components for the same meeting retain the meeting's own `EntityGUID`; the next meeting gets a new one. `Extends` does not identify a component or component version. `Assignment` records associated responsibilities or actions; consult the schema for its allowed item shapes.

## Context and order

`Context` describes where the source data came from. `Path` can locate the source; `Document` can name a file, model, or dataset. `Document.LocalContext` selects a part within it, such as a page or sheet, using `Kind` and `Reference`. `PositionReference` can locate a region within that source, such as a bounding box. Project name, number, and aliases provide additional source labels. Stable source element identifiers belong in `EntityGUID` or `ForeignIDs`, not in a page or geometric-position field.

`SpatialContext` is optional, explicit containment information that can be read without opening payloads. Each outer array item is a path, ordered from outer to inner; each level names a `contextType` and references containing entity GUIDs. Custom nonempty context types are allowed.

`Series` is an optional array of `{ "name": "Team Meetings", "value": "Meeting 2" }` entries. It is a human-readable label, while a `StrangeMatter.Series.Collection` component is an entity containing metadata about the series. Series members reference that collection entity through `Extends`; the collection payload need not enumerate members. A meeting entry has its own `EntityGUID`; its recording, media, and transcript components describe that meeting and each references the collection. The recording type schemas require a nonempty `Extends`, though validation cannot prove that the referenced GUID belongs to the intended collection. Repeat the series label when each component needs header-first series discovery. `fractionalIndex` remains a separate optional component-level order key for insertable sequences or hierarchies, including entries created concurrently or out of order. A meeting's session component can hold the canonical meeting order key. Producers and consumers must agree on the sequence it orders and its encoding and comparison algorithm; the schema does not define them.

The `Collections/` and `Recordings/` type schemas constrain the common header, K classifications, and payload media types for the current recorder workflow. They deliberately do not constrain `Payload`: the recording app owns those structures. For a meeting, use `KomponentClassfication.object: "meeting"`; the same recording types can describe narrations with `"narration"`. Distinguish raw screen video from review video, microphone from system audio, and structured from readable transcripts in `KomponentClassfication.type` before opening payloads.

## Payload representation

`PayloadDataType` names the payload format, such as GeoJSON or TIFF. `Payload` is optional and accepts any JSON value. Put inline JSON **directly** in the `Payload` slot:

```json
"Payload": { "type": "FeatureCollection", "features": [] }
```

An array, number, boolean, string, or `null` can also be an inline JSON value. Do not turn an object into a string containing escaped JSON. An external payload can instead be represented by a URI string:

```json
"Payload": "https://example.org/model.usdc"
```

Binary content inside a JSON document must be encoded as JSON-safe text, such as Base64. Raw arbitrary bytes cannot appear between JSON string quotes. The header alone cannot distinguish a URI string from an encoded binary string or other literal string. The component type or an explicit payload profile must define that interpretation and the binary encoding. If no such contract exists, ask the producer before fetching or decoding a string; do not guess from its appearance.

## Implement consistently

- Validate instances with a Draft 2020-12 validator and report errors by property path. Use the schema itself for generation, import, export, UI constraints, and examples instead of maintaining a separate hand-written field list.
- `KomponentClassfication` is required and must contain at least one of its optional, nonempty string members. The schema does not impose a controlled vocabulary for those members. Other nested objects can reject unknown properties even though the root schema does not currently do so.
- When evolving the schema, check producers, consumers, stored instances, examples, and migrations for changed keys and shapes. Migrate callers deliberately rather than silently accepting incompatible data.
- Validate examples of inline JSON, URI payloads, UUIDv7 identities, `Context`, `SpatialContext`, and `Extends`. Schema validation checks structure; it cannot by itself prove that referenced entities exist, that an author owns an entity, or that a payload URI resolves.
