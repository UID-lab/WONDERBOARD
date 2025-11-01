import cloudinary from '../config/cloudinary.config';
import { BadRequestException } from '../utils/appError';

export interface MediaUploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
}

export const uploadMediaToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'comments'
): Promise<MediaUploadResult> => {
  try {
    // Determine resource type based on file mimetype
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: resourceType,
      quality: 'auto',
      fetch_format: 'auto',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new BadRequestException('Failed to upload media file');
  }
};

export const deleteMediaFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error for delete failures to avoid breaking the main flow
  }
};