# Project Plan: SchemaGraph Builder
**Interactive JSON Schema Lifecycle & Graph Instance Management**

This plan outlines the development of a web-based utility designed to manage the transition from abstract JSON Schema definitions to connected, relational instance data.

---

## 1. Project Vision & Input
The tool bridges the gap between schema design and data instantiation. As requested, the system will support:
* **Schema Evolution:** Loading, editing, and versioning of JSON schemas.
* **Data Synthesis:** Generating sample data stubs and populating them with mock values.
* **Migration:** Mapping and transitioning instance data between schema versions.
* **Graph Logic:** Visualizing and editing relationships between distinct data "components" within a graph canvas.

---

## 2. Technical Stack
A modern, lightweight, and local-first stack is recommended for performance and ease of deployment.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js (React)** | Core UI and routing architecture. |
| **Graph UI** | **React Flow** | Interactive canvas for visualizing components as nodes and relationships as edges. |
| **Validation** | **Ajv** | Industry-standard JSON Schema validation engine. |
| **Mocking** | **Faker.js** | Generating realistic sample data for schema attributes. |
| **State** | **Zustand** | Lightweight management of schema versions and data instances. |
| **Storage** | **Dexie.js** | IndexedDB wrapper for saving version history locally in the browser. |

---

## 3. Implementation Roadmap

### Phase 1: Schema Workbench & Versioning
* **Loader:** Interface to upload or paste existing JSON Schemas.
* **Visual Editor:** A tree-based or form-based editor to modify properties, types, and constraints without writing raw JSON.
* **Versioning System:** A "Commit" workflow that saves snapshots of schemas. Each version is stored with a timestamp and a parent ID to track the evolution of the data model.

### Phase 2: Instance Factory & Migration
* **Template Generation:** Automatically create a valid JSON object (instance) based on the structure defined in a specific schema version.
* **Data Populator:** A toggle to fill "empty" instances with mock data (names, IDs, coordinates) using Faker.js.
* **Migration Wizard:** A side-by-side mapping interface. When a schema changes (e.g., a field is renamed), the user can define a mapping to migrate existing samples to the new structure.

### Phase 3: Graph Relationship Interface
* **Instance Nodes:** Render each JSON instance as a discrete node on a 2D canvas.
* **Edge Mapping:** Automatically draw lines (edges) between nodes based on "ID" or "Ref" fields defined in the schema.
* **Interactive Linking:** Allow users to drag a connection from "Component A" to "Component B." This action automatically updates the underlying JSON data with the correct relationship ID.

---

## 4. Key Workflows

1.  **Define:** Load a schema and define "Component Types" (e.g., *Space*, *Equipment*, *System*).
2.  **Version:** Edit the schema to add a new relationship type and save it as `v1.1.0`.
3.  **Instantiate:** Create 10 sample "Spaces" based on the `v1.1.0` template.
4.  **Connect:** Open the Graph View and link the *Spaces* together visually; export the resulting connected JSON data.

---

## 5. Success Metrics
* **Validation Accuracy:** All generated sample data must pass Ajv validation against the active schema version.
* **Relational Integrity:** Graph edges must stay synchronized with internal JSON reference IDs in real-time.
* **Schema Portability:** Ability to export both the versioned schemas and the connected instance data as standard `.json` files.