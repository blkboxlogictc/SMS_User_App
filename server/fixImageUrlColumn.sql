-- Fix the image_url column length in businesses table
-- The current column is truncating URLs at 85 characters
-- We need to make it longer to accommodate full Supabase storage URLs

-- Check current column definition
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name = 'image_url';

-- Alter the column to allow longer URLs
-- Supabase storage URLs can be up to 200+ characters
ALTER TABLE businesses 
ALTER COLUMN image_url TYPE VARCHAR(500);

-- Verify the change
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name = 'image_url';

-- Test with a long URL
UPDATE businesses 
SET image_url = 'https://jjcjmuxjbrubdwuxvovy.supabase.co/storage/v1/object/public/business_images/14/business.png'
WHERE id = 14;

-- Verify the URL was stored correctly
SELECT id, name, image_url, LENGTH(image_url) as url_length
FROM businesses 
WHERE id = 14;