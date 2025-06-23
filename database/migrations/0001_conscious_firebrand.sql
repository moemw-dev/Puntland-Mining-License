ALTER TABLE "licenses"
ALTER COLUMN "license_area"
TYPE text[]
USING string_to_array("license_area", ',');
