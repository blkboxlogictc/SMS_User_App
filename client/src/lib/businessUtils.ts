import { supabase } from './supabase';

export async function checkIfUserNeedsBusinessSetup(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('user_needs_business_setup', {
      user_id_param: userId
    });
    
    if (error) {
      console.error('Error checking business setup status:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error checking business setup status:', error);
    return false;
  }
}