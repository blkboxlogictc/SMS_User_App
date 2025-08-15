import { supabase } from './supabase';

// Image compression utility
const compressImage = async (file: File, maxSizeMB = 1, maxWidth = 800): Promise<File> => {
  const img = await createImageBitmap(file);
  
  // Calculate scaling
  const scale = Math.min(
    1,
    maxWidth / img.width,
    Math.sqrt((maxSizeMB * 1024 * 1024) / file.size)
  );
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Image compression failed'));
        return;
      }
      const compressedFile = new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now()
      });
      resolve(compressedFile);
    }, file.type, 0.7);
  });
};

// Validate file type and size
const validateImageFile = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.';
  }

  // 5MB limit before compression
  if (file.size > 5 * 1024 * 1024) {
    return 'File is too large. Maximum size is 5MB.';
  }

  return null;
};

export async function uploadProfileImage(userId: string, file: File): Promise<string | null> {
  try {
    console.log('Starting profile image upload for user:', userId);
    
    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Compress image
    const compressedFile = await compressImage(file);
    console.log('Image compressed:', compressedFile.size, 'bytes');

    // Get session for authentication (same as other API calls)
    let session = null;
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      session = result.data?.session;
      console.log('Session retrieved for upload:', !!session?.access_token);
    } catch (sessionError) {
      console.warn('Session retrieval failed, trying localStorage fallback:', sessionError);
      // Try localStorage fallback (same as queryClient.ts)
      try {
        const authKey = `sb-jjcjmuxjbrubdwuxvovy-auth-token`;
        const authData = localStorage.getItem(authKey);
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          session = parsedAuth;
          console.log('Session retrieved from localStorage:', !!session?.access_token);
        }
      } catch (fallbackError) {
        console.warn('localStorage fallback failed:', fallbackError);
      }
    }

    if (!session?.access_token) {
      throw new Error('No authentication token available. Please sign in again.');
    }

    // Create FormData for file upload (same as your API route expects)
    const formData = new FormData();
    formData.append('file', compressedFile);

    console.log('Uploading via API route...');

    // Use your existing API route with proper authentication
    const response = await fetch('/api/upload-profile-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload API error:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload successful:', result);

    if (!result.success || !result.imageUrl) {
      throw new Error('Upload failed: Invalid response from server');
    }

    return result.imageUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error; // Re-throw to let the UI handle the error display
  }
}

export async function uploadBusinessImage(businessId: number, file: File): Promise<string | null> {
  try {
    console.log('Starting business image upload for business:', businessId);
    
    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Compress image (larger size for business images)
    const compressedFile = await compressImage(file, 2, 1200); // 2MB, 1200px max width
    console.log('Business image compressed:', compressedFile.size, 'bytes');

    // Get session for authentication (same as other API calls)
    let session = null;
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      session = result.data?.session;
      console.log('Session retrieved for business upload:', !!session?.access_token);
    } catch (sessionError) {
      console.warn('Session retrieval failed, trying localStorage fallback:', sessionError);
      // Try localStorage fallback
      try {
        const authKey = `sb-jjcjmuxjbrubdwuxvovy-auth-token`;
        const authData = localStorage.getItem(authKey);
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          session = parsedAuth;
          console.log('Business session retrieved from localStorage:', !!session?.access_token);
        }
      } catch (fallbackError) {
        console.warn('Business localStorage fallback failed:', fallbackError);
      }
    }

    if (!session?.access_token) {
      throw new Error('No authentication token available. Please sign in again.');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('businessId', businessId.toString());

    console.log('Uploading business image via API route...');

    // Use your existing API route with proper authentication
    const response = await fetch('/api/upload-business-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Business upload API error:', response.status, errorText);
      throw new Error(`Business upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Business upload successful:', result);

    if (!result.success || !result.imageUrl) {
      throw new Error('Business upload failed: Invalid response from server');
    }

    return result.imageUrl;
  } catch (error) {
    console.error('Error uploading business image:', error);
    throw error; // Re-throw to let the UI handle the error display
  }
}