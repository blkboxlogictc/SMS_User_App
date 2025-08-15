-- RPC function to create business and link to user atomically
CREATE OR REPLACE FUNCTION create_business_for_user(
  user_id TEXT,
  business_data JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_business_id INTEGER;
BEGIN
  -- Insert the business
  INSERT INTO businesses (
    name,
    category,
    description,
    website,
    phone,
    address,
    latitude,
    longitude,
    hours,
    image_url,
    is_open,
    owner_id
  ) VALUES (
    business_data->>'name',
    business_data->>'category',
    business_data->>'description',
    business_data->>'website',
    business_data->>'phone',
    business_data->>'address',
    COALESCE((business_data->>'latitude')::REAL, NULL),
    COALESCE((business_data->>'longitude')::REAL, NULL),
    business_data->>'hours',
    business_data->>'image_url',
    COALESCE((business_data->>'is_open')::BOOLEAN, true),
    user_id
  ) RETURNING id INTO new_business_id;

  -- Update the user with the business_id
  UPDATE users 
  SET business_id = new_business_id,
      updated_at = NOW()
  WHERE id = user_id;

  RETURN new_business_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_business_for_user(TEXT, JSONB) TO authenticated;