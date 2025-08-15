-- Remove problematic functions that are interfering with business image URLs
-- These functions are likely truncating the image_url field

-- First, check if there are any triggers using these functions
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%update_business_image_url%'
   OR action_statement LIKE '%generate_business_image_url%'
   OR action_statement LIKE '%get_business_images%';

-- Drop the problematic functions
-- Note: This will also drop any triggers that depend on these functions

DROP FUNCTION IF EXISTS update_business_image_url CASCADE;
DROP FUNCTION IF EXISTS generate_business_image_url CASCADE;
DROP FUNCTION IF EXISTS get_business_images CASCADE;

-- Verify the functions are gone
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'update_business_image_url',
    'generate_business_image_url', 
    'get_business_images'
);

-- Test that we can now update image URLs properly
UPDATE businesses 
SET image_url = 'https://jjcjmuxjbrubdwuxvovy.supabase.co/storage/v1/object/public/business_images/14/business_test_full_url.png'
WHERE id = 14;

-- Verify the full URL was stored
SELECT 
    id, 
    name, 
    image_url, 
    LENGTH(image_url) as url_length,
    updated_at
FROM businesses 
WHERE id = 14;