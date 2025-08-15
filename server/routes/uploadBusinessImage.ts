import { Request, Response } from 'express';
import { supabase, requireSupabaseAuth } from '../supabaseAuth';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for business images
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

export const uploadBusinessImageHandler = [
  upload.single('file'),
  requireSupabaseAuth,
  async (req: any, res: Response) => {
    console.log('=== BUSINESS IMAGE UPLOAD STARTED ===');
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    console.log('Body params:', req.body);
    console.log('Authenticated user:', req.user?.id);
    
    try {
      if (!req.file) {
        console.log('ERROR: No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get businessId from request body
      const businessId = req.body.businessId;
      if (!businessId) {
        console.log('ERROR: No business ID provided');
        return res.status(400).json({ error: 'Business ID is required' });
      }

      console.log('Business ID:', businessId);

      const file = req.file;
      const userId = req.user.id; // From requireSupabaseAuth middleware

      // Check user permissions (business owner)
      console.log('Checking business ownership...');
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', businessId)
        .single();

      if (businessError || !businessData) {
        console.log('ERROR: Business not found:', businessError);
        return res.status(404).json({ error: 'Business not found' });
      }

      // Ensure current user is business owner
      if (businessData.owner_id !== userId) {
        console.log('ERROR: Unauthorized - user is not business owner');
        return res.status(403).json({ error: 'Unauthorized: You can only upload images for your own business' });
      }

      console.log('Business ownership verified');

      // Get current business data to check for existing image
      console.log('Checking for existing business image...');
      const { data: currentBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('image_url')
        .eq('id', businessId)
        .single();

      if (fetchError) {
        console.error('Error fetching current business data:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch business data' });
      }

      // Delete old image if it exists
      if (currentBusiness?.image_url) {
        try {
          // Extract the file path from the current URL
          const urlParts = currentBusiness.image_url.split('/');
          const bucketIndex = urlParts.findIndex((part: string) => part === 'business_images');
          if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
            const filePath = urlParts.slice(bucketIndex + 1).join('/');
            console.log('Deleting old business image:', filePath);
            
            const { error: deleteError } = await supabase.storage
              .from('business_images')
              .remove([filePath]);
            
            if (deleteError) {
              console.warn('Warning: Could not delete old image:', deleteError);
              // Don't fail the upload if we can't delete the old image
            } else {
              console.log('Old business image deleted successfully');
            }
          }
        } catch (deleteErr) {
          console.warn('Warning: Error processing old image deletion:', deleteErr);
          // Don't fail the upload if we can't delete the old image
        }
      }

      // Generate filename preserving original extension but using a consistent name
      const fileExt = file.originalname.split('.').pop() || 'jpg';
      const fileName = `${businessId}/business.${fileExt}`;
      console.log('Generated filename with folder structure:', fileName);

      // Upload to Supabase storage
      console.log('Uploading to Supabase storage...');
      const { data, error: uploadError } = await supabase.storage
        .from('business_images')
        .upload(fileName, file.buffer, {
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

      console.log('File uploaded successfully to storage');

      // Use Supabase client SDK to get public URL (recommended approach)
      const { data: urlData } = supabase.storage
        .from('business_images')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      console.log('Generated public URL using SDK:', publicUrl);

      // Update business image URL in database
      console.log('Updating business image URL in database...');
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ image_url: publicUrl })
        .eq('id', businessId)
        .eq('owner_id', userId); // Double-check ownership

      if (updateError) {
        console.error('Database update error:', updateError);
        return res.status(500).json({
          error: 'Failed to update business image URL',
          details: updateError.message
        });
      }

      console.log('Database updated successfully');
      console.log('=== BUSINESS IMAGE UPLOAD COMPLETED ===');

      res.json({
        success: true,
        imageUrl: publicUrl,
        message: 'Business image uploaded successfully'
      });

    } catch (error) {
      console.error('Business image upload error:', error);
      console.log('=== BUSINESS IMAGE UPLOAD FAILED ===');
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];