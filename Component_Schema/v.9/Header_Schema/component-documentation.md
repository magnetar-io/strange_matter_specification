# Strange Matter Component Schema Documentation

## Overview

**Title:** Component  
**Version:** 0.9  
**Date:** 2025-09-07  
**Description:** Schema for Strange Matter Component specification defining the structure and metadata for components in the Strange Matter ecosystem

## Schema Properties

### ComponentType
- **Type:** string
- **Pattern:** (empty - to be defined)
- **Description:** A URI that hosts the component definitions for things like Enums of ComponentClassification, Payloads Etc. This Mockup is in JSON Schema, but it could be any valid choice for definitions

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

### GraphSequenceNumber
- **Type:** integer
- **Description:** A sequence number for ordering components within a graph structure

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

### Extends
- **Type:** array of strings
- **Description:** To create a graph of data that the author potentially doesn't control, it's necessary to be able to reference other data. For validation and ease of traversal it needs to be expressive such that the IDs are prefixed with a 'how I'm extending' the component indicator. So by including an Archetype (ART), the author is saying I see this as a Requirement Object, not one that should hold any data, and that a Typical (TPC) entity is going to be extended multiple times Etc. They can be combined as needed as prefixes, but the general patterns should be Function, then IDs, include a version. Foreign model references include both human-readable names and EntityGUIDs for precise linking.

#### Extends Items
- **Type:** string
- **Enum Values:**
  - ACT
  - TPC
  - INT
  - ENT
  - COM
  - VER
- **Pattern:** (empty - to be defined)

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

## Required Fields

The following fields are required in all component instances:

- ComponentType
- ComponentInfo
- AuthorIdentifier
- Context
- GraphSequenceNumber
- UsedAsA
- ComponentClassification
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
