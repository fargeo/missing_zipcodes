{{#zipcodes}}
insert into [dbo].[GeoVector]
           ([Name]
           ,[Label]
           ,[GeoVectorCategoryType_ID]
           ,[GeoVectorType_ID]
           ,[GeoVectorSubType_ID]
           ,[GeoValue]
           ,[Description])
     values
           ('ZipCode Boundary'
           ,'{{ZipCode}}'
		   , NULL
		   , NULL
		   , NULL
           ,geometry::STGeomFromText('{{WKT}}', 3310)
           ,'{{ZipCode}}');

{{/zipcodes}}

{{#areas}}
insert into [dbo].[Area]
        ([InspectorGroupType_ID]
        ,[AreaName])
    values (
        (select [GenericLookup_ID] from [dbo].[GenericLookup] where type ='InspectorGroupType' and DisplayValue = '{{type}}')
        ,'{{areaName}}'
    );
       
{{#zipcodes}}
insert into [dbo].[AreaZipCode]
        ([Area_ID]
        ,[GeoVector_ID])
    values (
        (select [Area_ID] from [dbo].[Area] where [AreaName] = '{{areaName}}')
        ,(select [GeoVector_ID] from [dbo].[GeoVector] where [Name] = 'ZipCode Boundary' and [Label] = '{{zip}}')
    );
           
{{/zipcodes}}
{{#inspectors}}
insert into [dbo].[AreaInspector]
        ([Inspector_ID]
        ,[Area_ID]
        ,[AssignmentType_ID])
    values (
        (select [Contact_ID] from [dbo].[Contact] where [Email1] = '{{email}}' and [isEmployee] = 1)
        ,(select [Area_ID] from [dbo].[Area] where [AreaName] = '{{areaName}}')
        ,(select [GenericLookup_ID] from [dbo].[GenericLookup] where [Type] = 'AssignmentType' and [DisplayValue] = '{{type}}')
    );

{{/inspectors}}

{{/areas}}