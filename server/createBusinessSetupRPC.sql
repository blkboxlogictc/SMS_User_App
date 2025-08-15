-- Create RPC function to check if a business user needs to set up their business
CREATE OR REPLACE FUNCTION user_needs_business_setup(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    business_count INTEGER;
BEGIN
    -- Get the user's role from auth.users metadata
    SELECT 
        COALESCE(
            (raw_user_meta_data->>'role')::TEXT,
            'patron'
        ) INTO user_role
    FROM auth.users 
    WHERE id = user_id_param;
    
    -- If user is not a business owner, they don't need business setup
    IF user_role != 'business' THEN
        RETURN FALSE;
    END IF;
    
    -- Count how many businesses this user owns
    SELECT COUNT(*) INTO business_count
    FROM businesses 
    WHERE owner_id = user_id_param;
    
    -- If business owner has no businesses, they need setup
    RETURN business_count = 0;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION user_needs_business_setup(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_needs_business_setup(UUID) TO anon;
GRANT EXECUTE ON FUNCTION user_needs_business_setup(UUID) TO service_role;

-- Test the function with a sample UUID
SELECT user_needs_business_setup('09c87edd-62dc-44d7-8893-0ab0ecc71257'::UUID) as needs_setup;