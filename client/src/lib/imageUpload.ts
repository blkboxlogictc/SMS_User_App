import { supabase } from './supabase';

// File validation constants
const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BUSINESS_IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Validate image file
function validateImageFile(file: File, maxSize: number): void {
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.');
  }
}

// Upload profile image for current user using API endpoint
export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  console.log('=== FRONTEND UPLOAD STARTED ===');
  console.log('File info:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  console.log('User ID:', userId);
  
  try {
    // Validate file
    console.log('Validating file...');
    validateImageFile(file, PROFILE_IMAGE_MAX_SIZE);
    console.log('File validation passed');

    // Get session using the same pattern as apiRequest function
    console.log('Getting auth session...');
    let session = null;
    
    try {
      // Try to get session with a shorter timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      session = result.data?.session;
      console.log('Session retrieved successfully:', !!session, !!session?.access_token);
    } catch (sessionError) {
      console.warn('Session retrieval failed:', sessionError);
      // Try to get session from localStorage directly as fallback
      try {
        const authKey = `sb-jjcjmuxjbrubdwuxvovy-auth-token`;
        const authData = localStorage.getItem(authKey);
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          session = parsedAuth;
          console.log('Session retrieved from localStorage fallback:', !!session?.access_token);
        }
      } catch (fallbackError) {
        console.warn('localStorage fallback also failed:', fallbackError);
      }
    }

    if (!session?.access_token) {
      console.log('ERROR: No authentication token available');
      throw new Error('No authentication token available');
    }

    // Create FormData for file upload
    console.log('Creating FormData...');
    const formData = new FormData();
    formData.append('file', file);
    console.log('FormData created');

    // Upload via API endpoint using the same auth pattern as apiRequest
    console.log('Making API request to /api/upload-profile-image...');
    const response = await fetch('/api/upload-profile-image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      credentials: 'include'
    });

    console.log('API response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      console.log('Response not OK, parsing error...');
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      console.log('Error data:', errorData);
      throw new Error(errorData.error || errorData.details || 'Failed to upload profile image');
    }

    console.log('Parsing successful response...');
    const result = await response.json();
    console.log('Upload result:', result);
    console.log('=== FRONTEND UPLOAD COMPLETED ===');
    return result.imageUrl;
  } catch (error) {
    console.error('Profile image upload error:', error);
    console.log('=== FRONTEND UPLOAD FAILED ===');
    throw error;
  }
}

// Upload business image using API endpoint
export async function uploadBusinessImage(file: File, businessId: number, userId: string): Promise<string> {
  console.log('=== BUSINESS IMAGE UPLOAD STARTED ===');
  console.log('File info:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  console.log('Business ID:', businessId);
  console.log('User ID:', userId);
  
  try {
    // Validate file
    console.log('Validating file...');
    validateImageFile(file, BUSINESS_IMAGE_MAX_SIZE);
    console.log('File validation passed');

    // Get session using the same pattern as apiRequest function
    console.log('Getting auth session...');
    let session = null;
    
    try {
      // Try to get session with a shorter timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      session = result.data?.session;
      console.log('Session retrieved successfully:', !!session, !!session?.access_token);
    } catch (sessionError) {
      console.warn('Session retrieval failed:', sessionError);
      // Try to get session from localStorage directly as fallback
      try {
        const authKey = `sb-jjcjmuxjbrubdwuxvovy-auth-token`;
        const authData = localStorage.getItem(authKey);
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          session = parsedAuth;
          console.log('Session retrieved from localStorage fallback:', !!session?.access_token);
        }
      } catch (fallbackError) {
        console.warn('localStorage fallback also failed:', fallbackError);
      }
    }

    if (!session?.access_token) {
      console.log('ERROR: No authentication token available');
      throw new Error('No authentication token available');
    }

    // Create FormData for file upload
    console.log('Creating FormData...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessId', businessId.toString());
    console.log('FormData created');

    // Upload via API endpoint using the same auth pattern as apiRequest
    console.log('Making API request to /api/upload-business-image...');
    const response = await fetch('/api/upload-business-image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      credentials: 'include'
    });

    console.log('API response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      console.log('Response not OK, parsing error...');
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.error || 'Failed to upload business image');
    }

    console.log('Parsing successful response...');
    const result = await response.json();
    console.log('Upload result:', result);
    console.log('=== BUSINESS IMAGE UPLOAD COMPLETED ===');
    return result.imageUrl;
  } catch (error) {
    console.error('Business image upload error:', error);
    console.log('=== BUSINESS IMAGE UPLOAD FAILED ===');
    throw error;
  }
}

// Delete image from storage (optional cleanup)
export async function deleteImageFromStorage(bucket: string, fileName: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Failed to delete image:', error);
      throw new Error('Failed to delete image from storage');
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
}

// Extract filename from URL for deletion
export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch {
    return null;
  }
}