# Cloudinary Setup Guide

This guide will help you set up Cloudinary for media uploads in your comments system.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be redirected to your dashboard

## Step 2: Get Your Cloudinary Credentials

1. On your Cloudinary dashboard, you'll see your account details:
   - **Cloud Name**: This is your unique cloud name
   - **API Key**: Your API key for authentication
   - **API Secret**: Your API secret (keep this secure)

## Step 3: Configure Environment Variables

1. Open your `backend/.env` file
2. Replace the placeholder values with your actual Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## Step 4: Test the Setup

1. Start your backend server:

   ```bash
   cd backend
   npm run server
   ```

2. Start your frontend:

   ```bash
   cd client
   npm run dev
   ```

3. Navigate to a task and try uploading an image or video in the comments section

## Features Included

### Rich Media Support

- **Images**: PNG, JPG, JPEG, GIF, WebP
- **Videos**: MP4, AVI, MOV, WMV, WebM
- **Documents**: PDF, TXT files
- **File Size Limit**: 50MB per file

### Link Support

- Add clickable links using markdown syntax: `[Link Text](https://example.com)`
- Links open in new tabs with external link indicators

### User Interface

- Drag & drop file uploads
- Image preview with zoom functionality
- Video player with controls
- File download and external view options
- Rich text editing with link insertion

### Storage & Optimization

- Files are automatically uploaded to Cloudinary
- Images are optimized for web delivery
- Automatic format conversion for better performance
- Secure file storage with public URLs

## Cloudinary Features Used

- **Auto Quality**: Automatically optimizes image quality
- **Auto Format**: Converts images to the best format for each browser
- **Folder Organization**: Files are organized in a 'comments' folder
- **Secure URLs**: All uploaded files use HTTPS URLs

## Security Considerations

1. **API Secret**: Never expose your API secret in frontend code
2. **File Validation**: Only allowed file types can be uploaded
3. **Size Limits**: Files are limited to 50MB to prevent abuse
4. **Authentication**: Only authenticated users can upload files

## Troubleshooting

### Upload Fails

- Check your Cloudinary credentials in `.env`
- Ensure your Cloudinary account is active
- Verify file size is under 50MB
- Check file type is supported

### Images Don't Display

- Verify the Cloudinary URLs are accessible
- Check browser console for CORS errors
- Ensure your Cloudinary account has sufficient quota

### Performance Issues

- Cloudinary automatically optimizes images
- Consider implementing lazy loading for large comment threads
- Monitor your Cloudinary usage quota

## Cloudinary Dashboard

Access your Cloudinary dashboard at: https://cloudinary.com/console

Here you can:

- Monitor usage and quota
- View uploaded files
- Configure additional settings
- Set up transformations
- Manage security settings

## Cost Considerations

Cloudinary offers:

- **Free Tier**: 25GB storage, 25GB bandwidth per month
- **Paid Plans**: Available for higher usage
- **Pay-as-you-go**: Options for occasional high usage

Monitor your usage in the Cloudinary dashboard to avoid unexpected charges.
