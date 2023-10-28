## Component Definitions:

**component_type**: Named definition for the component  
**component_type_reference**: URI pointing to its definition  
**component_type_guid**: UUID7 for the component  
**component_type_version_guid**: UUID7 for the component version  
**component_version**: Semantic version of the component definition  
**component_hash**: Hash of the Component Definition 
**classification_reference**: URI for the classification reference 

## ComponentInstanceDataSource:

**author**: Name of the author, which can be a person, company, etc.  
**context**: Domain/source from which the instance data originated  
**source_data**: URL or URI for definition data  
**source_data_file_date**: Creation date of the file or similar container  
**source_data_file_id**: ID for the file or similar container  
**source_data_file_version_id**: Version ID for the file or similar container  
**source_data_item_id**: ID from the source application  
**source_data_item_version_id**: ID for the version from the source application  
**source_data_other**: Other values from the source key to identifying the data  

## ComponentInstanceHeader:

**entity_guid**: UUID7 value representing the entity  
**component_guid**: UUID7 value for the component  
**version**: Human-readable semantic version  
**version_id**: UUID7 version GUID  
**version_increment**: Used to track modifications when using a version control system  
**date_created**: DateTime of the payload's creation  
**name**: User name for the item  
**classification_value**: Classification value for the item  
**sequence_name**: Name of the sequence if the component is part of one  
**sequence_id**: UUID7 for the sequence  
**sequence_value**: Ordered number for the sequence  
**option**: Specific option of the data  
**phase**: Specific user data phase  
**status**: Status of the item (e.g., WIP, Active, Other)  
**active**: Active status (e.g., Yes/No)  

## Responce Header 
**component_responces**: Array of previous headers from components. 

# If the Data is a payload use the payloads

## ComponentInstancePayloadDetails:

**authoring_software**: Name of the software used for authoring  
**payload_hash**: Specific hash of the payload data  
**hash_definition**: Link or description of the hash  
**payload_data_type**: Encoding of the payload  
**payload_data_type_definition**: Definition for the payload encoding  


## ComponentInstancePayload:

**payload_encoding**: Encoding of the payload  
**payload_encryption**: Encryption status or type of the payload  
**payload_data**: Local path or URL/URI for the payload data  

# If the the Data is a component us the components

## ComponentInstanceRelationship:

**source_entities**: Array of Source entity IDs  
**source_components**: Array of Source component IDs  
**source_component_type**: Type of source component  
**destination_entities**: Array of destination entity IDs  
**destination_components**: Array of destination component IDs  
**destination_component_type**: Type of destination component  

