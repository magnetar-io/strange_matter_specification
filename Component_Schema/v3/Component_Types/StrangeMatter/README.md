# Strange Matter component types

This directory contains component type JSON Schemas **published by Strange Matter**. Other publishers can define types against the common [V3 header schema](../../Header_Schema/component_v3.json) in their own repositories. A schema's `ComponentType` value is its stable publisher-qualified identity; its folder is for navigation and does not change that identity.

Create type schemas when a workflow needs them, then create instances that validate against the type schema. The category boundaries below are a starting point and can be refactored as real types reveal better groupings. Do not create a schema merely to fill a category.

| Directory | Intended scope |
| --- | --- |
| `Drawings/` | Drawing and sheet information as a deliverable or composition. |
| `Views/` | View geometry, view graphics, and view-specific information. A view-specific geometry type belongs here even if its extent has two or three coordinates. |
| `Issues/` | Issues and their workflow data. |
| `Meetings/` | Meetings and records arising from them. |
| `Collections/` | Reusable collection metadata, including named series. |
| `Recordings/` | Capture sessions, media tracks, events, logs, transcripts, and their provenance. |
| `Geometry/2D/` | Reusable two-dimensional geometry not specific to a view. |
| `Geometry/3D/` | Reusable three-dimensional geometry not specific to a view. |
| `Specifications/` | Specification content. |
| `Requirements/` | Requirements and their conditions. |
| `Programs/` | Program information. |

Choose a home by the component type's reusable data contract, rather than by a particular instance's classification or storage format. For example, `StrangeMatter.View.Geometry` stays in `Views/`; its `KomponentClassfication` can name `floor plan orthographic`, while the payload holds the geometry values. Keep the type's schema version in `SchemaVersion` and validate through its reference to the common header schema.

The recording schemas define header discovery and classification, not the app-owned payload contracts. `StrangeMatter.Series.Collection` describes metadata about a series; meeting components share a meeting `EntityGUID` and point through `Extends` to the collection entity. The collection need not enumerate every member in its payload. Use `KomponentClassfication.object: "meeting"` for meeting recordings and `"narration"` for narrations. A session component can carry the meeting's `fractionalIndex` for series order; `Series` carries the human-readable name and entry label.

| Type schema | `KomponentClassfication.type` for the current meeting workflow | Source output |
| --- | --- | --- |
| [Series.Collection](Collections/StrangeMatter.Series.Collection.schema.json) | `meeting series` | Series metadata authored by the app |
| [Recording.Session](Recordings/StrangeMatter.Recording.Session.schema.json) | `meeting recording session` | `session.json` |
| [Recording.Video](Recordings/StrangeMatter.Recording.Video.schema.json) | `screen capture video`, `review video` | `video.mp4`, `review.mp4` |
| [Recording.Audio](Recordings/StrangeMatter.Recording.Audio.schema.json) | `microphone audio`, `system audio` | Microphone and system audio files |
| [Recording.EventStream](Recordings/StrangeMatter.Recording.EventStream.schema.json) | `recording event stream` | `events.jsonl` |
| [Recording.CaptureJournal](Recordings/StrangeMatter.Recording.CaptureJournal.schema.json) | `capture journal` | `capture-journal.json` |
| [Recording.DiagnosticLog](Recordings/StrangeMatter.Recording.DiagnosticLog.schema.json) | `native capture diagnostic log` | `capture-native.log` |
| [Recording.Transcript](Recordings/StrangeMatter.Recording.Transcript.schema.json) | `timed structured transcript`, `readable transcript` | `transcript.json`, `transcript.md` |
| [Recording.TranscriptProvenance](Recordings/StrangeMatter.Recording.TranscriptProvenance.schema.json) | `transcript generation metadata` | `transcript-metadata.json` |
