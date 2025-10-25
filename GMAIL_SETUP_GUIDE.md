# Gmail Setup Guide for Email Notifications

## Current Issue
The Gmail password in your `.env` file (`abcd efgh ijkl mnop`) appears to be a placeholder and won't work for authentication.

## Steps to Set Up Gmail App Password

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the steps to enable 2-factor authentication if not already enabled

### 2. Generate App Password
1. After 2FA is enabled, go back to Security settings
2. Under "Signing in to Google", click on "App passwords"
3. Select "Mail" as the app and "Other (Custom name)" as the device
4. Enter "Wonder Board" as the custom name
5. Click "Generate"
6. Copy the 16-character app password (it will look like: `abcd efgh ijkl mnop`)

### 3. Update .env File
Replace the current EMAIL_PASS in your `.env` file with the generated app password:

```env
EMAIL_USER=gilbertstanley311@gmail.com
EMAIL_PASS=your_16_character_app_password_here
```

### 4. Test the Configuration
Run the email test to verify it's working:

```bash
cd backend
npm run test-email
```

## Security Notes
- Never share your app password
- The app password is specific to this application
- You can revoke it anytime from your Google Account settings
- Regular Gmail password won't work - you must use an app password

## Alternative: Use Different Email Service
If you prefer not to use Gmail, you can:
1. Use any SMTP service (Outlook, Yahoo, etc.)
2. Update the email service configuration in `backend/src/services/email.service.ts`
3. Modify the transporter settings accordingly

## Troubleshooting
- **"Invalid login" error**: App password is incorrect or 2FA not enabled
- **"Less secure app access"**: This is outdated - use app passwords instead
- **Connection timeout**: Check firewall/network settings