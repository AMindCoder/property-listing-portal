-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for fuzzy text search on Property table
CREATE INDEX IF NOT EXISTS idx_property_title_trgm 
  ON "Property" USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_property_location_trgm 
  ON "Property" USING gin(location gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_property_area_trgm 
  ON "Property" USING gin(area gin_trgm_ops);

-- Create B-tree indexes for filter performance
CREATE INDEX IF NOT EXISTS idx_property_area 
  ON "Property"(area);

CREATE INDEX IF NOT EXISTS idx_property_price 
  ON "Property"(price);

CREATE INDEX IF NOT EXISTS idx_property_status 
  ON "Property"(status);

CREATE INDEX IF NOT EXISTS idx_property_type 
  ON "Property"("propertyType");

CREATE INDEX IF NOT EXISTS idx_property_created 
  ON "Property"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_property_bedrooms 
  ON "Property"(bedrooms);

CREATE INDEX IF NOT EXISTS idx_property_bathrooms 
  ON "Property"(bathrooms);
