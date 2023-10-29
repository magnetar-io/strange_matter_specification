

# Component Details

Components are units of data for Strange Matter.  Components need to be able to exist on their own in the world.  To enable this, they have detailed information that must be present in their headers.    Some methods could be developed to carry duplicate data in containers, but for now, the protocol requires this information set. 

## Component Definitions: The source, definition, and identifiers of the component being used in an instance. 

**component_type**: The human-readable name for the component.  
**component_type_reference**: URI of the hosted library for the component  
**component_type_guid**: The UUID7 id for the component (this is because we can't assume that the internet is forever and need to be able to identify different versions.  UUID7 because it contains uniqueness and time)  
**component_type_version_guid**: UUID7 to identify the version of the component  
**component_version**: Semantic version of the component definition used for humans to follow and track  
**component_hash**: Hash of the Component Definition as there could be scenarios where different information is added to the component definition  

## ComponentInstanceDataSource: Where did the instance data in the component come from?  As this is coming from objects inside tools, we need to have robust knowledge of the source. 

**author**: Name of the author, which can be a person, company, etc.  
**author_identifier**: Name or Number of the scope that this data refers to  
**context**: Domain/source from which the instance data originated  
**source_data**: URL or URI for the data source for this component  
**source_data_file_date**: Creation date of the file, database, etc  
**source_data_file_id**: ID for the file or similar container  
**source_data_file_version_id**: Version ID for the file or similar container  
**source_data_item_id**: ID from the source application of the referenced object  
**source_data_item_version_id**: ID for the version from the source application of the referenced object  
**source_data_other**: Other values from the source key to identifying the data  

## ComponentInstanceHeader: The Strange Matter data that identifies the object and its history, external to any tool or application. 

**entity_guid**: UUID7 value representing the entity  
**component_guid**: UUID7 value for the component  
**version**: Human-readable semantic version  
**version_guid**: UUID7 version GUID  
**component_hash**: Hash of the component instance header details
**version_increment**: Used to track modifications when using a version control system  
**date_created**: DateTime of the payload's creation  
**name**: User name for the item  
**classification_value**: Classification value for the item (up for debate if this is included)  
**sequence_name**: Name of the sequence if the component is part of one (optional)   
**sequence_guid**: UUID7 for the sequence (optional)   
**sequence_value**: Ordered number for the sequence (optional)   
**option**: Specific option of the data (optional)  
**phase**: Specific user data phase (optional)  
**status**: Status of the item (e.g., WIP, Active, Other)  
**active**: Active status (e.g., Yes/No)  

## ComponentInstanceResponcesHeader 
**component_responses**:  Array of previous headers from components that this data is created in response to. 

# If the Data is a payload, use the payload sections

## ComponentInstancePayloadDetails:

**payload_hash**: Specific hash of the payload data  
**hash_definition**: Link or description of the hash  
**payload_data_type**: Encoding of the payload  
**payload_data_type_definition**: Definition for the payload encoding  


## ComponentInstancePayload:

**payload_encoding**: Encoding of the payload  
**payload_encryption**: Encryption status or type of the payload  
**payload_data**: Embedded URL/URI for the payload data  

# If the the Data is a component, use the relationship, 

## ComponentInstanceRelationship:

**source_entities**: Array of Source entity IDs  
**source_components**: Array of Source component IDs  
**source_component_type**: Array of types of source component   
**source)_component_classification**: Array of the classification applied to components
**destination_entities**: Array of destination entity IDs  
**destination_components**: Array of destination component IDs  
**destination_component_type**: Array of type of destination component  
**destination_classfication**: Array of the classification applied to components

