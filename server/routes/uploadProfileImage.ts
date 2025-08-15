import { Request, Response } from 'express';
import { supabase, requireSupabaseAuth } from '../supabaseAuth';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.'));
    }
  },
});

export const uploadProfileImageHandler = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    console.log('=== PROFILE IMAGE UPLOAD STARTED ===');
    console.log('Headers:', req.headers);
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    
    try {
      // Get user from auth token
      const authHeader = req.headers.authorization;
      console.log('Auth header:', authHeader ? 'Present' : 'Missing');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('ERROR: Missing or invalid authorization header');
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.substring(7);
      console.log('Token extracted, length:', token.length);
      
      // Verify the token with Supabase
      console.log('Verifying token with Supabase...');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return res.status(401).json({ error: 'Invalid authentication token' });
      }

      console.log('User authenticated:', user.id);

      if (!req.file) {
        console.log('ERROR: No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      const userId = user.id;

      console.log('Processing file upload for user:', userId);

      // Generate filename with user folder structure
      const fileExt = file.originalname.split('.').pop() || 'jpg';
      const fileName = `${userId}/profile.${fileExt}`;
      console.log('Generated filename:', fileName);

      // WORKAROUND: Upload to business_images bucket with user-profiles prefix
      // because profile_images bucket has missing storage function issues
      const profileFileName = `user-profiles/${fileName}`;
      console.log('Uploading to business_images bucket with user-profiles prefix...');
      const { data, error: uploadError } = await supabase.storage
        .from('business_images')
        .upload(profileFileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({
          error: 'Failed to upload image to storage',
          details: uploadError.message
        });
      }

      console.log('File uploaded successfully to storage:', data);

      // Use Supabase client SDK to get public URL (recommended approach)
      const { data: urlData } = supabase.storage
        .from('business_images')
        .getPublicUrl(profileFileName);
      
      const publicUrl = urlData.publicUrl;
      console.log('Generated public URL using SDK:', publicUrl);

      // Update user's metadata with profile image URL
      console.log('Updating user metadata with profile image URL...');
      console.log('NOTE: We are NOT updating any database table, only user metadata');
      
      try {
        const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...user.user_metadata,
            profile_image_url: publicUrl
          }
        });

        if (metadataError) {
          console.error('User metadata update error:', metadataError);
          // Don't fail the request if metadata update fails, since the image was uploaded successfully
          console.warn('Continuing despite metadata update failure...');
        } else {
          console.log('User metadata updated successfully');
        }
      } catch (metadataException) {
        console.error('Exception during metadata update:', metadataException);
        // Don't fail the request if metadata update fails, since the image was uploaded successfully
        console.warn('Continuing despite metadata update exception...');
      }
      console.log('=== PROFILE IMAGE UPLOAD COMPLETED ===');

      res.json({
        success: true,
        imageUrl: publicUrl,
        message: 'Profile image uploaded successfully'
      });

    } catch (error) {
      console.error('Profile image upload error:', error);
      console.log('=== PROFILE IMAGE UPLOAD FAILED ===');
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];