

# Strange Matter Protocol

Strange matter is format, vendor, and tool agnostic.

It is a way for people, processes, and tools with different requirements working together on design and construction projects to collaborate on data that has distributed ownership, comes from different sources, and that is continuously changing.

Strange Matter does this by providing a universal abstract concept of entity. That is the thing that people care about (whether it is a particular building, floor, facade, column, duct, asset, or whatever) and for which more or less data may be available to different stakeholders over different periods of time, authored in different pieces of software.

Actual data in a Strange Matter project is organized into components and relationships. Components are JSON headers that refer to data payloads, which can be in any format a user or tool generates. Relationships are defined in the same way as components, just without payloads, and can describe any kind of semantic relation between two components. A relationship between a component and entity is done by sharing a relationship with an Entity ID component.

## Structure 

Components are meant to be the smallest unit of useful data about an object.  Given the need, the amount of data in a component could be as small as a single property or point or could contain many objects and properties.   Strange Matter is designed with the idea that if you make well-defined small data structures that map to real data workflows, it becomes much easier to connect data to a workflow. 

### The Basics of the Protocol

The main concepts behind Strange Matter come from Entity Component Systems. ECS.
Instead of Inheritance-based objects and data, it follows a Composition model.
Here is a good technical background. [Leatherbee
ECS](https://leatherbee.org/index.php/2019/09/12/ecs-1-inheritance-vs-composition-and-ecs-background/)

It should be said from the outset that Strange Matter  learns from ECS but given the need to
allow for a distributed approach, it diverges in some key areas, so while ECS is
the precedent Strange Matter follows its own rules and so is best described as a
means to compose data.

The graphic below illustrates the core ideas. A single entity might be fully
described using several different data types from other standards and
systems. Hence, an object-based definition from classical programming is not well
suited.

# Details



## Component
Everything is a component.  A component is the base object for storing instance data.  It stores a  subset of data that describes the shared object identified by the **Entity**.  Components are used to carry or reference data and to identify relationships.

Components are units of data for Strange Matter.  Components need to be able to exist on their own in the world.  To enable this, they have detailed information that must be present in their headers.    Some methods could be developed to carry duplicate data in containers, but for now, the protocol requires this information set. 

## Component Header vs Payload

Components have two distinct parts—header vs the Payload.  The Header must be standard and consistent across use cases, and thus, Strange Matter must Specify this fully.   Strange Matter does not specify the payload and should only specify a payload where it's required to unify differing datatypes. 

This leans heavily on several precedents.   The Internet layer stack is the most visualizable, but at the same time, EDI and Email are good touch references as well. 

![](https://github.com/magnetar-io/strange_matter_specification/blob/main/media/Like_Internet.svg)

The goal is to separate the transport and relationship-making from the kind of data being related and stored.   This is to allow data types that are completely non-compatible to "talk"  to one another without having to coerce them into a standard format where data loss and all kinds of interoperability issues become a problem.

**The header specifies what the component is, who created it, what kind of serialization and structure you'll find in the payload, versions ... etc.**

**The payload is to the choosing of the creator.  It could be json, images, geojson, blobs, binary ifc, rvt , any format, and any encoding of data should be supported** 

![](https://github.com/magnetar-io/strange_matter_specification/blob/main/media/payload_header.svg)

The protocol specifies that inside a component, you need to find the following information.  

 This ensures the complete component is intact when it moves between platforms, tools, etc.   This is a foundational requirement of the protocol and should not be violated. 

Components need to do a lot of heavy lifting as they need to be able to exist in the world without the benefit of a file container that would often help describe the source, contents, etc, of the data inside it.    Because of this fact and because components need to be able to satisfy workflows, it is essential that a component carry around a wealth of information that helps a user of the data understand it fully without any other reference. 



## Component Header Requirements

### Component - Header -  Source: The source, definition, and identifiers of the component used in an instance. 

**component_type**: The human-readable name for the component. (required)  
**component_type_reference**: URI of the hosted library for the component (required)  
**component_type_guid**: The UUID7 id for the component (required) (this is because we can't assume that the internet is forever and need to be able to identify different versions.  UUID7 because it contains uniqueness and time)  
**component_type_version_guid**: UUID7 to identify the version of the component (required) 
**component_version**: Semantic version of the component definition used for humans to follow and track (required) 
**component_hash**: Hash of the Component Definition as there could be scenarios where different information is added to the component definition  (required)

### Component - Header - Data Source:  Where did the instance data in the component come from?  As this is coming from objects inside tools, we need to have robust knowledge of the source. 

**author**: Name of the author, which can be a person, company, etc. (required) 
**author_identifier**: Name or Number of the scope that this data refers to (required)  
**context**: Domain/source from which the instance data originated (required) 
**source_data**: URL or URI for the data source for this component (required) 
**source_data_file_date**: Creation date of the file, database, etc (required) 
**source_data_file_id**: ID for the file or similar container (required) 
**source_data_file_version_id**: Version ID for the file or similar container (required) 
**source_data_item_id**: ID from the source application of the referenced object (required)  
**source_data_item_version_id**: ID for the version from the source application of the referenced object (required) 
**source_data_other**: Other values from the source key to identifying the data  (optional)

### Component - Header - Strange Matter Identifiers: The Strange Matter data that identifies the object and its history, external to any tool or application. 

**entity_guid**: UUID7 value representing the entity (required) 
**component_guid**: UUID7 value for the component (required) 
**version**: Human-readable semantic version (required)  
**version_guid**: UUID7 version GUID (required) 
**component_hash**: Hash of the component instance header details (required)
**version_increment**: Used to track modifications when using a version control system (required) 
**date_created**: DateTime of the payload's creation (required) 
**name**: User name for the item (required) 
**classification_value**: Classification value for the item (up for debate if this is included) (required) 
**sequence_name**: Name of the sequence if the component is part of one (optional)   
**sequence_guid**: UUID7 for the sequence (optional)   
**sequence_value**: Ordered number for the sequence (optional)   
**option**: Specific option of the data (optional)  
**phase**: Specific user data phase (optional)  
**status**: Status of the item (e.g., WIP, Active, Other) (required) 
**active**: Active status (e.g., Yes/No)  (required)

### Component - Header - Responses:
**component_responses**:  Array of previous headers from components that this data is created in response to. (required)

### Component - Header - Payload Details:

**payload_hash**: Specific hash of the payload data (required)  
**hash_definition**: Link or description of the hash (required) 
**payload_data_type**: Encoding of the payload (required) 
**payload_data_type_definition**: Definition for the payload encoding  (required)


### Component - Header - Payload :

**payload_encoding**: Encoding of the payload (required)  
**payload_encryption**: Encryption status or type of the payload (required)  
**payload_data**: Embedded or sURL/URI for the payload data (required) 

## Payload Types

## Data or Relationship as Data 

### Data

Strange Matter doesn't care and should never care what data is a payload.   This allows it to be abstract and solves the underlying issue that there will never be one datatype to rule them all.  Instead, it's assumed that when a unique kind of data. IFC, Images, GeoJSON, ETC defined, then the definers will pick the protocols needed to identify the data.  



### Relationship

A fundamental concept of Strange Matter is the ablity to related data together.  Thus a relationship is a means to specify a named relationship between two or more components.  These Components can either be part of the same Entity or deferent Entiies. 

There are several identified relationship configurations. 

- **Component to Component **

  A relationship that that links one explicitly to a component and not all components that are part of an Entity.  If an element has two geometric components and one of them clashes with another Entities Geometric representation then an Component to Component relationship is required as a means of specifying that just these components are involved.    This is very useful for options, changes in configuration over time and an host of other scenarios. 

- **Component to Entity**

  When wanting to relate a component from other Entity to another its logically to have a Component to Entity Relationship. There is some speculation that this can be accomplished via the ID component but its unclear if this is indeed logical.  The base use case for this is many to one relationships.  When you want to say all Entities have the same geometry then you'd have a 1 to Many relationship between a "typical component" that has the shared geometry and all other components that should use that geometry. 

- **Entity to Entity (TBD)**

  Its unclear if this is necessary or useful at this time. 

  




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

# Sample Data 



```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "ComponentDefinitions": {
      "type": "object",
      "properties": {
        "component_type": {
          "type": "string",
          "description": "The human-readable name for the component",
          "required": true
        },
        "component_type_reference": {
          "type": "string",
          "format": "uri",
          "description": "URI of the hosted library for the component",
          "required": true
        },
        "component_type_guid": {
          "type": "string",
          "description": "The UUID7 id for the component (required)",
          "required": true
        },
        "component_type_version_guid": {
          "type": "string",
          "description": "UUID7 to identify the version of the component",
          "required": true
        },
        "component_version": {
          "type": "string",
          "description": "Semantic version of the component definition used for humans to follow and track",
          "required": true
        },
        "component_hash": {
          "type": "string",
          "description": "Hash of the Component Definition as there could be scenarios where different information is added to the component definition",
          "required": true
        }
      }
    },
    "ComponentInstanceDataSource": {
      "type": "object",
      "properties": {
        "author": {
          "type": "string",
          "description": "Name of the author, which can be a person, company, etc.",
          "required": true
        },
        "author_identifier": {
          "type": "string",
          "description": "Name or Number of the scope that this data refers to",
          "required": true
        },
        "context": {
          "type": "string",
          "description": "Domain/source from which the instance data originated",
          "required": true
        },
        "source_data": {
          "type": "string",
          "format": "uri",
          "description": "URL or URI for the data source for this component",
          "required": true
        },
        "source_data_file_date": {
          "type": "string",
          "description": "Creation date of the file, database, etc",
          "required": true
        },
        "source_data_file_id": {
          "type": "string",
          "description": "ID for the file or similar container",
          "required": true
        },
        "source_data_file_version_id": {
          "type": "string",
          "description": "Version ID for the file or similar container",
          "required": true
        },
        "source_data_item_id": {
          "type": "string",
          "description": "ID from the source application of the referenced object",
          "required": true
        },
        "source_data_item_version_id": {
          "type": "string",
          "description": "ID for the version from the source application of the referenced object",
          "required": true
        },
        "source_data_other": {
          "type": "string",
          "description": "Other values from the source key to identifying the data"
        }
      }
    },
    "ComponentInstanceHeader": {
      "type": "object",
      "properties": {
        "entity_guid": {
          "type": "string",
          "description": "UUID7 value representing the entity",
          "required": true
        },
        "component_guid": {
          "type": "string",
          "description": "UUID7 value for the component",
          "required": true
        },
        "version": {
          "type": "string",
          "description": "Human-readable semantic version",
          "required": true
        },
        "version_guid": {
          "type": "string",
          "description": "UUID7 version GUID",
          "required": true
        },
        "component_hash": {
          "type": "string",
          "description": "Hash of the component instance header details",
          "required": true
        },
        "version_increment": {
          "type": "integer",
          "description": "Used to track modifications when using a version control system",
          "required": true
        },
        "date_created": {
          "type": "string",
          "format": "date-time",
          "description": "DateTime of the payload's creation",
          "required": true
        },
        "name": {
          "type": "string",
          "description": "User name for the item",
          "required": true
        },
        "classification_value": {
          "type": "string",
          "description": "Classification value for the item (up for debate if this is included)",
          "required": true
        },
        "sequence_name": {
          "type": "string",
          "description": "Name of the sequence if the component is part of one"
        },
        "sequence_guid": {
          "type": "string",
          "description": "UUID7 for the sequence"
        },
        "sequence_value": {
          "type": "integer",
          "description": "Ordered number for the sequence"
        },
        "option": {
          "type": "string",
          "description": "Specific option of the data"
        },
        "phase": {
          "type": "string",
          "description": "Specific user data phase"
        },
        "status": {
          "type": "string",
          "description": "Status of the item (e.g., WIP, Active, Other)",
          "required": true
        },
        "active": {
          "type": "boolean",
          "description": "Active status (e.g., Yes/No)",
          "required": true
        }
      }
    },
    "ComponentInstanceResponsesHeader": {
      "type": "object",
      "properties": {
        "component_responses": {
          "type": "array",
          "items": {
            "type": "object"
          },
          "description": "Array of previous headers from components that this data is created in response to",
          "required": true
        }
      }
    },
    "ComponentInstancePayloadDetails": {
      "type": "object",
      "properties": {
        "payload_hash": {
          "type": "string",
          "description": "Specific hash of the payload data",
          "required": true
        },
        "hash_definition": {
          "type": "string",
          "description": "Link or description of the hash",
          "required": true
        },
        "payload_data_type": {
          "type": "string",
          "description": "Encoding of the payload",
          "required": true
        },
        "payload_data_type_definition": {
          "type": "string",
          "description": "Definition for the payload encoding",
          "required": true
        }
      }
    },
    "ComponentInstancePayload": {
      "type": "object",
      "properties": {
        "payload_encoding": {
          "type": "string",
          "description": "Encoding of the payload",
          "required

```



Open Question?  - What is the best format to start with?

Criteria. 

1. Open and Standard
2. Can describe data inside components and create restrictions that can be translated into software
3. Allow specification of object relationship restrictions between components

Sample of a payload Definition for the Fire and Smoke Properties of walls and slabs in JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "FireRating": {
      "type": "integer",
      "minimum": 0,
      "maximum": 3,
      "description": "Fire Rating defined by HOK using URIs from buildingSMART, HOK, and ICC."
    },
    "SmokeRating": {
      "type": "integer",
      "minimum": 0,
      "maximum": 3,
      "description": "Smoke Rating defined by HOK using URIs from buildingSMART, HOK, and ICC."
    },
    "FireSmokeRating": {
      "type": "integer",
      "minimum": 0,
      "maximum": 3,
      "description": "Fire Smoke Rating defined by HOK using URIs from buildingSMART, HOK, and ICC."
    }
  },
  "required": ["FireRating", "SmokeRating", "FireSmokeRating"]
}


```

OpenAPI Example

```yaml
openapi: 3.0.0
info:
  title: My Fire Properties API
  version: 1.0.0
paths:
  /fire-properties:
    post:
      summary: Create a new set of fire properties
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                FireRating:
                  type: integer
                  minimum: 0
                  maximum: 3
                  description: Fire Rating defined by HOK using URIs from buildingSMART, HOK, and ICC.
                SmokeRating:
                  type: integer
                  minimum: 0
                  maximum: 3
                  description: Smoke Rating defined by HOK using URIs from buildingSMART, HOK, and ICC.
                FireSmokeRating:
                  type: integer
                  minimum: 0
                  maximum: 3
                  description: Fire Smoke Rating defined by HOK using URIs from buildingSMART, HOK, and ICC.
              required:
                - FireRating
                - SmokeRating
                - FireSmokeRating
      responses:
        '201':
          description: Created



```

SHACL

```SHACL
@prefix ex: <http://example.org/fire-properties#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:FirePropertiesShape
  a sh:NodeShape ;
  sh:property [
    sh:path ex:FireRating ;
    sh:datatype xsd:integer ;
    sh:minInclusive 0 ;
    sh:maxInclusive 3 ;
    sh:description "Fire Rating defined by HOK using URIs from buildingSMART, HOK, and ICC." ;
  ] ;
  sh:property [
    sh:path ex:SmokeRating ;
    sh:datatype xsd:integer ;
    sh:minInclusive 0 ;
    sh:maxInclusive 3 ;
    sh:description "Smoke Rating defined by HOK using URIs from buildingSMART, HOK, and ICC." ;
  ] ;
  sh:property [
    sh:path ex:FireSmokeRating ;
    sh:datatype xsd:integer ;
    sh:minInclusive 0 ;
    sh:maxInclusive 3 ;
    sh:description "Fire Smoke Rating defined by HOK using URIs from buildingSMART, HOK, and ICC." ;
  ] .

ex:FirePropertiesShape
  sh:targetClass ex:FireProperties .

# Additional information about the component
ex:HOKFireRating
  a ex:Component ;
  ex:componentName "HOK Fire Rating" ;
  ex:componentAuthor "HOK" ;
  ex:componentURIs [
    <buildingSMART_URI>,
    <HOK_URI>,
    <ICC_URI>
  ] .

```





# Strange Matter Design Criteria

The list of criteria can seem long but it's addressable looking across topics and issues or you can arrive at something holistic. 

| **Requirement**                                              | **Type**               | **Design Solution**                                          |
| ------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------ |
| Data is assembled across many sources. It changes over time, has many versions and states. A single thing might be simultaneously in design, construction and operations all at the same time. | Functionality          | Entity Component Model where the Components are Packets of Data. This is augmented by relationships that are also components. This allows data to be continuously added and related together while having no impact on the existing data |
| To describe the built world we need GIS, BIM, text, requirements, issues, inspections, lidar data, point cloud data, products, carbon, energy just to name a few. No format, standard etc. can ever describe all this data so we need to find a way that can connect standard, nonstandard and even proprietary data without taking ownership of its description | Functionality          | Strange matter is format, vendor, and tool agnostic.         |
| Machine to Machine Readable                                  | Functionality          | There have been attempts to package heterogeneous data in formats previously, but the data was only labeled or classified and didn’t allow machine to machine communication. To solve this Strange Matter has proposed robust methods of data description and self-description of payloads |
| Heiarchy is in the eye of the beholder                       | Functionality          |                                                              |
| The data we use to digitally describe the built world relies heavily on relationships. Today relationships are formally describe inside the standards  but they are mostly at the service of the standard, and are not flexible for the end users to create and augment additional relationships. | Functionality          | Relationships are just as easy to create and compose as the data itself. This is a key requirement to incorporate automation, workflow and future machine learning capacities. |
| Data needs to work in many platforms, offline, online, archive, | Flexablity             | Strange Matter is rather simple in design but meant to work as a complete protocol as its indented to be whole, no matter the system that is used. It’s well suited to be stored, accessed and created in many technologies. <br />It’s simple enough that it can work as a file on disk, but it certainly can be use in SQL, NO-SQL, Graph and other formats. <br />The emergence of Columnar “File as Database” formats like [Apache Parquet](https://parquet.apache.org/) or [LanceDB](https://lancedb.github.io/lance/) that are becoming standard in the data science and ML world are very intriguing as they marry very well the component based approach. This opens the door for native ML and automation capabilities directly on the data. |
| Technology needs to enable solutions independent of contracts, governance or delivery models. | Flexibility            | One of the many challenges in the built environment is the variety of ways that the facilities / infrastructure are organized and managed. Strange Matter looks to provide much needed technological flexibility to work in these many different models and to enable the benefits of digitization while doing so. |
| File vs Web is not the way to understand the challenging our industry faces, instead choice and easy movement between this is important. | Robustness             | Moving from a file-based world to an all web world should not be a requirement for adoption and thus the system is flexible. In reality there is a strong interest in a middle ground that mirrors other distributed design and engineering driven industries like software development and Film and VFX, where file-based systems are used behind change and version management tools like Git and Github. |
| Embrace Web Technologies but don't lose data in doing so     | Robustness             | Strange Matter looks to use the web as much as possible to enable richer developer, user and data experiences but also acknowledges that while the web enables rich experiences it is not permanent. To allow for these two truths it looks reference the web when available but allow provide mechanisms to ensure that data collected in Strange Matter does not loose permanence if its web sources disappear. |
| Data history must be better supported and ownership clearer. | Provenance and History | Strange Matter is design to support this by allowing 2 modes of working. First is the simplest where in situations where no data change management system is in place the data is always immutable. This is possible because Entity, and Component UUIDS are stable for the life of objects. Only the Version UUID is to ever be changed. This can be used in conjunction with semantic versioning to have a copy of every single version of the data. In situations where a Change management system in place its possible for minor versions of the data to be overwritten but any published data should never be overwritten. This has a 1 to 1 parallel with how software code is used where WIP data can be updated but once it packaged it must be stored as a separate artifact. Thus, published data should never be mutated and stay immutable the same should be said where a specific component is authored and augmented by another application. The original data should never be mutated. |
| Data Ownership and Design Transfer.                          | Functionality          | One of the most complex problems in this space is ownership of Geometric and non-Geometric Data by Data Creating Software. The solution to this problem is to move from an editing model to an additive model. Where Components that are authored by one tool cannot be overwritten by another tool. Instead, they must reference the components and make the linkage to the existing Component and Entities and create a new version of the components. This approach has many benefits. It allows for Complex Geometric Data to be used in Simpler forms when the goal is not to exchange ownership but where new components based on the existing data is all that is required. Also, it allows for the “gold version” of complex geometry to be maintained even when its necessary to convert geometry to an applications internal data model. This is possible because components can have more than one geometric representation that can be on the same entity linked by a derives relationship. |
| A large part of data trust and security is not having to share unnecessarily.  Current monolithic file approaches require oversharing.  The solution to this problem must enable fine control of data access, sharing and consumption. | Functionality          | A component based approach is a great start but other design decisions are just as important. First is that components definitions themselves must be flexibly defined while still maintaining the link to standards.  Data that is provided by one party in one country, project or region is often provided by diffrent groups and thus standards must be flexibly adopted and not fixed. |
| Maintaining a data standard is an important part of industry success.  What should not be the case is that  data standard unnecessarily is reflect in the instance data. | Simplicity             | Instance Data should be easy to consume and thus as simple as possible. Any standards that adopts itself to the protocol should embrace this viewpoint. |
| There is a strong preference in being able to use tooling from the software world.  Like Git and other version control systems that work on a local first basis. | Simplicity             | A file based version of the protocol has looked to embrace this idea and is design to worked this way. |
| Data is independent of                                       | Flexibility            | Given the various uses of data, the container... (File, Database etc) that data sits in should not dictate its relationship with other data, instead it should allow end users to design how its presented to others. |
| Benefit for all Creators, Adders/Maintainers                 | Simplicity             | There is a                                                   |
| Out of Order and Additive                                    |                        |                                                              |
| Protocol not an API…                                         | Robustness             |                                                              |
| Strange Matter has one component (currently)                 |                        | 1 Component...                                               |
| Classsifcation is for funtion/ Component Type is for content |                        | ....                                                         |
|                                                              |                        |                                                              |
