import { Request, Response } from "express";
import { supabase, requireSupabaseAuth } from "../supabaseAuth";

export const removeBusinessImageHandler = [
  requireSupabaseAuth,
  async (req: any, res: Response) => {
    console.log("=== BUSINESS IMAGE REMOVAL STARTED ===");
    
    try {
      const { businessId } = req.params;
      const userId = req.user.id; // From requireSupabaseAuth middleware

      console.log("Authenticated user:", userId);
      console.log("Business ID:", businessId);

      // First, get the current business image URL to extract the file path
      const { data: business, error: fetchError } = await supabase
        .from("businesses")
        .select("image_url, owner_id")
        .eq("id", businessId)
        .eq("owner_id", userId)
        .single();

      if (fetchError) {
        console.log("Error fetching business:", fetchError);
        return res.status(404).json({ error: "Business not found or not owned by user" });
      }

      if (!business) {
        console.log("Business not found or not owned by user");
        return res.status(404).json({ error: "Business not found or not owned by user" });
      }

      console.log("Business ownership verified");
      console.log("Current image URL:", business.image_url);

      // Delete the image file from storage if it exists
      if (business.image_url) {
        try {
          // Extract the file path from the URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/business_images/[businessId]/[filename]
          const urlParts = business.image_url.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `${businessId}/${fileName}`;

          console.log("Deleting business image file:", filePath);

          const { error: deleteError } = await supabase.storage
            .from("business_images")
            .remove([filePath]);

          if (deleteError) {
            console.error("Error deleting business image file:", deleteError);
            // Don't fail the entire operation if file deletion fails
            // The file might already be deleted or not exist
          } else {
            console.log("Business image file deleted successfully");
          }
        } catch (error) {
          console.error("Error extracting file path or deleting file:", error);
          // Don't fail the entire operation if file deletion fails
        }
      } else {
        console.log("No image URL found, nothing to delete from storage");
      }

      // Update the database to remove the image URL
      const { error: updateError } = await supabase
        .from("businesses")
        .update({ image_url: null })
        .eq("id", businessId)
        .eq("owner_id", userId);

      if (updateError) {
        console.log("Error updating database:", updateError);
        return res.status(500).json({ error: "Failed to update database" });
      }

      console.log("Database updated successfully - image URL set to null");
      console.log("=== BUSINESS IMAGE REMOVAL COMPLETED ===");

      res.json({
        success: true,
        message: "Business image removed successfully"
      });

    } catch (error) {
      console.error("Error in removeBusinessImage:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
];