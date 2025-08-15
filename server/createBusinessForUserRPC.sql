-- Create RPC function to create a business for a user
CREATE OR REPLACE FUNCTION create_business_for_user(
    p_user_id UUID,
    p_name TEXT,
    p_category TEXT,
    p_description TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_hours TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_business_id INTEGER;
    business_record RECORD;
    result JSON;
BEGIN
    -- Insert the new business
    INSERT INTO businesses (
        name,
        category,
        description,
        address,
        phone,
        website,
        hours,
        owner_id,
        created_at,
        updated_at,
        is_open,
        wait_time,
        is_featured
    ) VALUES (
        p_name,
        p_category,
        p_description,
        p_address,
        p_phone,
        p_website,
        p_hours,
        p_user_id,
        NOW(),
        NOW(),
        true,
        0,
        false
    )
    RETURNING id INTO new_business_id;
    
    -- Get the complete business record
    SELECT * INTO business_record
    FROM businesses
    WHERE id = new_business_id;
    
    -- Return the business data as JSON
    SELECT json_build_object(
        'id', business_record.id,
        'name', business_record.name,
        'category', business_record.category,
        'description', business_record.description,
        'address', business_record.address,
        'phone', business_record.phone,
        'website', business_record.website,
        'hours', business_record.hours,
        'owner_id', business_record.owner_id,
        'created_at', business_record.created_at,
        'updated_at', business_record.updated_at,
        'is_open', business_record.is_open,
        'wait_time', business_record.wait_time,
        'image_url', business_record.image_url,
        'is_featured', business_record.is_featured
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_business_for_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_business_for_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_business_for_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Test the function with sample data
SELECT create_business_for_user(
    'c9e2cb69-b49d-4d68-8978-b7de8d68f49b'::UUID,
    'Test Business',
    'Restaurant',
    'A test business description',
    '123 Test St, Stuart, FL',
    '(555) 123-4567',
    'https://testbusiness.com',
    '{"monday": "9:00 AM - 5:00 PM", "tuesday": "9:00 AM - 5:00 PM"}'
) as test_result;