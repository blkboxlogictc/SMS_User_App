import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBusinessRPCFunction() {
  try {
    console.log('Creating business RPC function...');
    
    const sqlFunction = `
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
    `;

    // Execute the function creation
    const { data, error } = await supabase.rpc('exec', { sql: sqlFunction });
    
    if (error) {
      console.error('Error creating RPC function:', error);
      console.log('\nPlease manually execute this SQL in your Supabase SQL Editor:');
      console.log(sqlFunction);
      return;
    }

    console.log('RPC function created successfully!');
    
    // Grant permissions
    const grantSQL = `GRANT EXECUTE ON FUNCTION create_business_for_user(TEXT, JSONB) TO authenticated;`;
    const { error: grantError } = await supabase.rpc('exec', { sql: grantSQL });
    
    if (grantError) {
      console.log('Please also execute this grant statement:');
      console.log(grantSQL);
    } else {
      console.log('Permissions granted successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
    console.log('\nPlease manually execute the SQL from createBusinessRPC.sql in your Supabase SQL Editor.');
  }
}

createBusinessRPCFunction();