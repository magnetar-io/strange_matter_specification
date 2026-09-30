<p align="center">
  <img src="Logo.png" alt="Strange Matter logo" width="400" />
</p>

# Strange Matter Protocol

**Strange Matter — It's What Data Craves**

Strange Matter is a format, vendor, and tool agnostic way to compose data about a shared **entity**. An entity can be a building, room, door, asset, or another subject that different people and systems describe over time. Each description is a **component** with a common header and a payload. Components can be authored, related, and versioned independently.

## Current specification

The authoritative header contract is [Component Schema V3.04](Component_Schema/v3/Header_Schema/component_v3.json), declared as JSON Schema Draft 2020-12. Use that file for exact property names, required fields, types, and constraints. Agents implementing this version should read the [Strange Matter V3 skill](.agents/skills/strange-matter-v3/SKILL.md).

For a new kind of component, define a reusable component type JSON Schema first, then create instances that validate against it. The component type fixes a publisher-qualified `ComponentType` name and defines the common payload structure; `KomponentClassfication` describes how each instance is used.

Strange Matter-published component types live in the [component type library](Component_Schema/v3/Component_Types/StrangeMatter/README.md), organized by provisional subject areas. The first example is [StrangeMatter.View.Geometry](Component_Schema/v3/Component_Types/StrangeMatter/Views/StrangeMatter.View.Geometry.schema.json). It describes view geometry separately from view metadata. `KomponentClassfication.type` names a complete representation such as “floor plan orthographic” or “structural ceiling plan orthographic.” Consumers should know what a component contains from its type, classification, and other header fields without opening the payload. The payload supplies the values. Perspective representations can be added in a later type-schema version with a classification-selected payload branch.

The library also contains [series collection and recording type schemas](Component_Schema/v3/Component_Types/StrangeMatter/README.md) for meeting sessions, media tracks, event streams, logs, transcripts, and transcript provenance. These schemas define discoverable headers and leave payload structures to the recording app.

For a view workflow, `StrangeMatter.View.Geometry` describes input geometry. A future `StrangeMatter.View.Graphics` type can describe graphical output such as a PNG or PDF; `PayloadDataType` distinguishes those formats. Both can describe the same view entity, with `KomponentClassfication.object` set to `view` for view-first discovery.

The [historical overview](docs/legacy-readme.md) preserves earlier design discussion and a v.9 schema. It is background material, not the V3.04 validation contract. The [wiki](https://github.com/magnetar-io/strange_matter_specification/wiki) contains broader development topics.

## How the pieces fit

- **Entity:** The thing being described. Its `EntityGUID` is reused by components that describe that same thing.
- **Component:** One independently authored contribution of data. `ComponentGUID` identifies the component and `ComponentVersionGUID` identifies a version of it. All three Strange Matter GUIDs are UUIDv7.
- **Type and classification:** `ComponentType` names a reusable data contract. `KomponentClassfication` names the particular representation, such as `floor plan orthographic`. A view's geometry and graphics can be separate components on the same entity, selected from their headers without reading payloads.
- **Role and relationships:** `UsedAsA` distinguishes instances, reusable Typicals, Archetypes, relationships, groups, and collections. `Extends` references another entity when adding information or when a component belongs to a series collection; the referenced entity's data remains independently owned.
- **Context:** `Context` identifies the source project, document, and location within that document. Optional `SpatialContext` gives explicit containment paths that can be read without opening payloads.
- **Series and order:** A collection entity holds series metadata. Meeting components point to it through `Extends` and can carry a readable `Series` entry such as Team Meetings / Meeting 2. A separate component-level `fractionalIndex` supplies an order key when entries may be inserted or created out of order.
- **Payload:** `PayloadDataType` identifies the content format. `Payload` can hold inline JSON or a string whose meaning is defined by the component type or payload profile.

## Putting data in `Payload`

When the data is JSON, put its value directly after the `Payload` key. For example, a GeoJSON object is an object value, not a string containing escaped JSON:

```json
"Payload": {
  "type": "FeatureCollection",
  "features": []
}
```

A payload stored elsewhere can be represented by a URI string. Binary content stored inside the JSON component must be encoded into JSON-safe text, such as Base64; raw binary bytes cannot appear in a JSON string. The component type or payload profile must tell a consumer whether a string is a URI, literal text, or encoded binary, and how to decode it.

## Design intent

The shared header makes independently authored data identifiable and connectable while leaving payload formats to their producers. Relationships and collections can organize data across tools and storage systems. Version identity and explicit references allow one contributor to add information about another contributor's entity without overwriting the original component data.

<p align="center">
  <img src="What_Data_Craves.png" alt="Strange Matter — It's What Data Craves" width="600" />
</p>
