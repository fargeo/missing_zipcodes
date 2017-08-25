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
           ,geometry::STGeomFromText('{{WKT}}', 3310);
           ,'{{ZipCode}}');

{{/zipcodes}}
