# Strange Matter

Strange matter is format, vendor, and tool agnostic.

It is a way for people, processes, and tools with different requirements working together on design and construction projects to collaborate on data that has distributed ownership, comes from different sources, and that is continuously changing.

Strange Matter does this by providing a universal abstract concept of entity. That is the thing that people care about (whether it is a particular building, floor, facade, column, duct, asset, or whatever) and for which more or less data may be available to different stakeholders over different periods of time, authored in different pieces of software.

Actual data in a Strange Matter project is organized in components and relationships. Components are JSON headers that refer to data payloads, which can be in any format a user or tool generates. Relationships are defined in the same way as components, just without payloads, and can describe any kind of semantic relation between two components. A relationship between a component and entity is done by sharing a relationship with an Entity ID component.

# Terms

### Component
Everything is a component.  A component is the base object for storing instance data.  It stores a  subset of data that is used to describe the shared object identified by the **Entity**.  It has two variants a **Payload Component** or a **Relationship Component**

- ### Component as Payload

  Components that store descriptive data about an Entity are Payload Components. Descriptive data meaning. Geometry, Properties, Colors, Materials, Text etc.  

- ### Component as Payload

  Components that reference other Components creating a named relationship between them.  Examples are ProvidesType, InheritsFrom, ClashesWith, Etc. 

### Component - Definition
This is the formal way to describe a component.  It leverages JSON-LD as a means to describe the component. Component Definition is a piler of this approach as many components can reference the underlying data definitions. 

Sample of a payload Definition. 

```json
{
    "@context": {
      "strange_matter_component_payload_definition_version":"0.1",
      "strange_matter_version_date": "20230827",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ID_Component": "http://example.org/vocab#ID_Component",
      "name": {
        "@id": "http://schema.org/name",
        "@type": "xsd:string"
      },
      "usernumber": {
        "@id": "http://example.org/vocab#usernumber",
        "@type": "xsd:string"
      },
      "classification": {
        "@id": "http://example.org/vocab#classification",
        "@type": "xsd:string"
      },
      "description": {
        "@id": "http://schema.org/description",
        "@type": "xsd:string"
      },
      "language": {
        "@id": "http://schema.org/language",
        "@type": "xsd:language"
      }
    }
  }
  
```



### Component - Instance
A component populated  with a header, payload or relationship data

- ### Component - Instance  - Header

  When transitioning from a file to a component based workflow its required that the components are very well defined and contain enough self description to ensure that if a single component is found "in the wild" years from when its created it provenance is clear and known if not complexly defined. 

  

  The header has several sub parts.  These are described in JSON-LD as are the Component Definitions. 

  ### Component Context (Source)

  This the where JSON-LD makes a lot of sense it allows all the difference data sources to be called out.   This section indicates that this is a definition for a component and its the "0.1 Version" of the component definition and the definition uses XML and its hosted on the Github URL for Strange Matter.  Its not wise for component definitions to vary but one can envision where the component might include special header data that is unique to a unease.  Its import to allow for such an expansion in the future. 

  ```json
      "@context": {
          "strange_matter_component_header_definition_schema_version":"0.1",
          "strange_matter_version_date": "20230827",
          "xsd": "http://www.w3.org/2001/XMLSchema#",
          "strange_matter_definition": "https://github.com/magnetar-io/strange_matter/blob/main/Component_Definition/Header/component_definition.json"
      },
  ```

  ### Component Definition

  This is where the meta data about the definition for the instance data to be contained is defined.  This Data is populated from the **Component - Definition** described above. 

  ```json
   {
              "@type": "ComponentDefinition",
              "component_type": {
                  "@value": "<Named Definition for the component>",
                  "@type": "xsd:string"
              },
              "component_type_reference": {
                  "@value": "<URI to its definition>",
                  "@type": "xsd:anyURI"
              },
              "component_type_guid": {
                  "@value": "<UUID7 of the Component>",
                  "@type": "xsd:string"
              },
              "component_type_version_guid": {
                  "@value": "<UUID7 of the Component Version>",
                  "@type": "xsd:string"
              },
              "component_version": {
                  "@value": "<Semantic Version of the Component Definition>",
                  "@type": "xsd:string"
              },
              "classification_reference": {
                  "@value": "URI for the Classification Reference.",
                  "@type": "xsd:anyURI"
              }
  ```

  ### Component Instance Data Source

  Once you have a component defined and you put data in it, its necessary to ensure that the source data can be pointed to in the future.  As Strange Matter doesn't look to be an application format itself its important that it includes the provenance data from which it came. 

  ```json
          {
              "@type": "ComponentInstanceDataSource",
              "author": {
                  "@value": ["<Authors name, person or company etc>"],
                  "@type": "xsd:string"
              },
              "context": {
                  "@value": "<Domain/ Source that the instance data originated from>",
                  "@type": "xsd:string"
              },
              "source_data": {
                  "@value": "<URL or URI for definition data>",
                  "@type": "xsd:anyURI"
              },
              "source_data_file_date": {
                  "@value": "<File or file like container date of creation>",
                  "@type": "xsd:date"
              },
              "source_data_file_id": {
                  "@value": "<File or file like container id>",
                  "@type": "xsd:string"
              },
              "source_data_file_version_id": {
                  "@value": "<File or file like container version id>",
                  "@type": "xsd:string"
              },
              "source_data_item_id": {
                  "@value": "<ID from the source application>",
                  "@type": "xsd:string"
              },
              "source_data_item_version_id": {
                  "@value": "<ID from the source application>",
                  "@type": "xsd:string"
              },
              "source_data_other": {
                  "@value": "<Other values from the source that are key to identifying the data>",
                  "@type": "xsd:string"
              }
  ```

  ### Component Instance Header

  Once you describe the source data then you need to be able to identify the data itself in Strange Matter.  So this includes everything needed to find a version of a certain type of data of a certain component that describes an entity. 

  ```json
          {
              "@type": "ComponentInstanceHeader",
              "entity_guid": {
                  "@value": "<UUID7 value to represent the Entity>",
                  "@type": "xsd:string"
              },
              "component_guid": {
                  "@value": "<UUID7 Value for the Component>",
                  "@type": "xsd:string"
              },
              "version": {
                  "@value": "<Human Readable Semantic Version>",
                  "@type": "xsd:string"
              },
              "version_id": {
                  "@value": "<UUID7 Version GUID>",
                  "@type": "xsd:string"
              },
              "version_increment": {
                  "@value": "<Used to track modification when using a version control system>",
                  "@type": "xsd:string"
              },
              "date_created": {
                  "@value": "<Creation_Date_Time of the Payload>",
                  "@type": "xsd:dateTime"
              },
              "name": {
                  "@value": "<User Name for the item>",
                  "@type": "xsd:string"
              },
              "classification_value": {
                  "@value": "Classification Value for the item",
                  "@type": "xsd:string"
              },
              "sequence_name": {
                  "@value": "<If the component is part of a sequence...this names that sequence>",
                  "@type": "xsd:string"
              },
              "sequence_id": {
                  "@value": "<UUID7 for the sequence>",
                  "@type": "xsd:string"
              },
              "sequence_value": {
                  "@value": "<Ordered Number for the sequence>",
                  "@type": "xsd:integer"
              },
              "option": {
                  "@value": "<Specific Option of the data>",
                  "@type": "xsd:string"
              },
              "phase": {
                  "@value": "<Specific User Data Phase>",
                  "@type": "xsd:string"
              },
              "status": {
                  "@value": "<WIP,Final,Other>",
                  "@type": "xsd:string"
              },
              "active": {
                  "@value": "<Yes/No>",
                  "@type": "xsd:bool"
              }
          },
  ```

  ### Component Instance Payload Details and Component Instance Payload

  What is the payload, and the specific of the payload.   This how one can create and differentiate different payloads describing the same component. It also provides the means to validate that the component and paylod are in sync by hashing the payload useing a standard definition or a data types specific hash. 

  ```json
          {
              "@type": "ComponentInstancePayloadDetails",
              "authoring_software": {
                  "@value": "<Name of the Authoring Software>",
                  "@type": "xsd:string"
              },
              "payload_hash": {
                  "@value": "<Hash of the payload data>",
                  "@type": "xsd:string"
              },
              "hash_definition": {
                  "@value": "<Link or description of hash>",
                  "@type": "xsd:anyURI"
              },
              "payload_data_type": {
                  "@value": "<encoding of the payload>",
                  "@type": "xsd:string"
              },
              "payload_data_type_definition": {
                  "@value": "<encoding of the payload>",
                  "@type": "xsd:anyURI"
              }
          },
          {
              "@type": "ComponentInstancePayload",
              "payload_encoding": {
                  "@value": "<Encoding of the payload>",
                  "@type": "xsd:string"
              },
              "payload_encryption": {
                  "@value": "?",
                  "@type": "xsd:string"
              },
              "payload_data": {
                  "@value": "<Local path or URL/URI>",
                  "@type": "xsd:anyURI"
              }
  ```

  ### 


### Relationship

A fundamental concept of Strange Matter is the ablity to related data together.  Thus a relationship is a means to specify a named relationship between two or more components.  These Components can either be part of the same Entity or deferent Entiies. 

There are several identified relationship configurations. 

- **Component to Component **

  A relationship that that links one explicitly to a component and not all components that are part of an Entity.  If an element has two geometric components and one of them clashes with another Entities Geometric representation then an Component to Component relationship is required as a means of specifying that just these components are involved.    This is very useful for options, changes in configuration over time and an host of other scenarios. 

- **Component to Entity**

  When wanting to relate a component from other Entity to another its logically to have a Component to Entity Relationship. There is some speculation that this can be accomplished via the ID component but its unclear if this is indeed logical.  The base use case for this is many to one relationships.  When you want to say all Entities have the same geometry then you'd have a 1 to Many relationship between a "typical component" that has the shared geometry and all other components that should use that geometry. 

- **Entity to Entity (TBD)**

  Its unclear if this is necessary or useful at this time. 

- ### Component Instance Relationship 

  If the component is a relationship component and not a payload component this provides the details. 

  ```json
          {
              "@type": "ComponentInstanceRelationship",
              "source_entities": {
                  "@value": "2XO9sNxaf0tBWBWE4fj28X",
                  "@type": "xsd:string"
              },
              "source_components": {
                  "@value": "12c5310a-fca8-434f-b36f-494754b157a4",
                  "@type": "xsd:string"
              },
              "source_component_type": {
                  "@value": "BuildingStory",
                  "@type": "xsd:string"
              },
              "destination_entities": {
                  "@value": [
                      "2XO9sNxaf0tBWBWF8fj06l", 
                      "2XO9sNxaf0tBWBWF8fj01x", 
                      "2XO9sNxaf0tBWBWF8fj3bd", 
                      // more items ...
                      "2XO9sNxaf0tBWBWE4fj2gH"
                  ],
                  "@type": "xsd:string"
              },
              "destination_components": {
                  "@value": [
                      "1cb6d448-9b57-48d1-8daf-b03e1c3fea86",
                      "32aedccb-4a4b-48fd-9181-0635d6cb281d",
                      // more items ...
                      "0bf7b19a-a6a7-448f-be4f-06d29a5d16c0"
                  ],
                  "@type": "xsd:string"
              },
              "destination_component_type": {
                  "@value": "",
                  "@type": "xsd:string"
              }
          }
  ```



### Collection
A Collection provides a means of defining a named group of components.  In practical terms this serves the function of a "File", without the limitations of files.  Typically files "own" the data defined in it, a collection simply references the data included in it.  This is analogous to a branch in Git the actual branch simply references the corrects versions of the data it contains.  The actual versions of the objects are all part of the Git project.  Just like in GIT a component (payload or relationship), can be part of multiple Collections. 
### # Entity
### # Payload
### # System
### # Scene
### # Element
### # PSetAll
### 
### 
### 
### 
### 
### # Archetype
### # Ledger
### # Classification
### 
### # Payload
### 
### # Sequence
### # Context
### # Component Type
### Source
### Destination