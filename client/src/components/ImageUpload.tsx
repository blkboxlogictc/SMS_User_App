import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
  maxSize?: number;
  className?: string;
  variant?: "profile" | "business";
  disabled?: boolean;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  maxSize = 5,
  className = "",
  variant = "profile",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.";
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSize}MB.`;
    }

    return null;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous validation errors
    setValidationError(null);

    // Validate file
    const validation = validateFile(file);
    if (validation) {
      setValidationError(validation);
      toast({
        title: "Invalid File",
        description: validation,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Simulate upload progress (since we don't have real progress from Supabase)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const newImageUrl = await onImageUpload(file);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Success!",
        description: `${
          variant === "profile" ? "Profile" : "Business"
        } image updated successfully.`,
      });

      // Clean up preview
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });

      // Clean up preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!onImageRemove) return;

    try {
      setIsUploading(true);
      await onImageRemove();

      toast({
        title: "Success!",
        description: `${
          variant === "profile" ? "Profile" : "Business"
        } image removed successfully.`,
      });
    } catch (error) {
      console.error("Image removal error:", error);
      toast({
        title: "Removal Failed",
        description:
          error instanceof Error ? error.message : "Failed to remove image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayImageUrl = previewUrl || currentImageUrl;
  const isProfile = variant === "profile";

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Image Display */}
      <div className={`relative ${isProfile ? "w-24 h-24" : "w-32 h-32"}`}>
        {displayImageUrl ? (
          <div className="relative w-full h-full">
            <img
              src={displayImageUrl}
              alt={`${variant} image`}
              className={`w-full h-full object-cover border-2 border-gray-200 ${
                isProfile ? "rounded-full" : "rounded-lg"
              }`}
            />
            {isUploading && (
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center ${
                  isProfile ? "rounded-full" : "rounded-lg"
                }`}
              >
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
                {uploadProgress > 0 && (
                  <div className="text-white text-xs font-medium">
                    {uploadProgress}%
                  </div>
                )}
              </div>
            )}
            {onImageRemove && !disabled && !isUploading && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <div
            className={`w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${
              isProfile ? "rounded-full" : "rounded-lg"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={!disabled ? triggerFileInput : undefined}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            ) : (
              <Camera size={isProfile ? 24 : 32} className="text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col items-center space-y-2">
        <Button
          onClick={triggerFileInput}
          disabled={disabled || isUploading}
          size="sm"
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Upload size={16} />
          <span>
            {currentImageUrl ? "Change" : "Upload"}{" "}
            {variant === "profile" ? "Profile" : "Business"} Image
          </span>
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Max {maxSize}MB • JPEG, PNG, GIF, WebP
          </p>
          {validationError && (
            <p className="text-xs text-red-500 mt-1">{validationError}</p>
          )}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-2">
              <div className="w-32 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
