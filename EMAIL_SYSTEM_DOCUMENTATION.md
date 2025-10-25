# Email Notification System Documentation

## Overview
The email notification system automatically sends beautifully designed emails when tasks are assigned or reassigned to users in the Wonder Board application.

## Features
- ✨ **Fancy HTML Email Templates**: Modern, responsive email designs with gradients and professional styling
- 🎯 **Task Assignment Notifications**: Automatic emails when new tasks are assigned
- 🔄 **Task Reassignment Notifications**: Different styled emails when tasks are reassigned
- 📧 **Gmail Integration**: Uses Gmail SMTP for reliable email delivery
- 🚫 **Smart Filtering**: Prevents self-assignment emails (no email sent if user assigns task to themselves)

## Email Configuration

### Environment Variables
The following environment variables need to be configured in `backend/.env`:

```env
EMAIL_USER=gilbertstanley311@gmail.com
EMAIL_PASS=your_gmail_app_password_here
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup
- **Email**: `gilbertstanley311@gmail.com`
- **Authentication**: Gmail App Password (16 characters)
- **Service**: Gmail SMTP (secure and reliable)

**⚠️ Important**: You must use a Gmail App Password, not your regular Gmail password.

### Setup Steps
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password** in Google Account Security settings
3. **Update .env file** with the generated app password
4. **Validate setup** by running: `npm run validate-gmail`

See `GMAIL_SETUP_GUIDE.md` for detailed instructions.

## Email Templates

### 1. Task Assignment Email
**Trigger**: When a new task is created with an assignee
**Subject**: `🎯 New Task Assigned: [Task Title]`
**Design**: Blue gradient header with task assignment styling

### 2. Task Reassignment Email  
**Trigger**: When an existing task's assignee is changed
**Subject**: `🔄 Task Reassigned: [Task Title]`
**Design**: Pink gradient header with reassignment styling

## Technical Implementation

### Email Service (`backend/src/services/email.service.ts`)
- `sendEmail()`: Core email sending function with Gmail/Ethereal fallback
- `sendTaskAssignmentEmail()`: Sends new task assignment notifications
- `sendTaskReassignmentEmail()`: Sends task reassignment notifications

### Task Service Integration (`backend/src/services/task.service.ts`)
- **Task Creation**: Automatically sends assignment email if task has assignee
- **Task Update**: Automatically sends reassignment email if assignee changes
- **Async Processing**: Emails are sent asynchronously to avoid blocking task operations

## Email Template Features

### Design Elements
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern Styling**: Gradient backgrounds, rounded corners, shadows
- 🎯 **Clear CTAs**: Prominent "View Task in Workspace" buttons
- 📋 **Task Information**: Clearly displayed task title and description
- 👤 **User Context**: Shows who assigned/reassigned the task

### Content Structure
1. **Header**: Eye-catching gradient with emoji and title
2. **Greeting**: Personalized message with assignee name
3. **Task Card**: Highlighted task details with description
4. **Action Button**: Direct link to workspace
5. **Quick Actions**: Helpful tips for task management
6. **Footer**: Branding and contact information

## Testing

### Validate Gmail Setup
First, validate your Gmail credentials:

```bash
cd backend
npm run validate-gmail
```

### Test Email Templates
Run the email template test script:

```bash
cd backend
npm run test-email
```

This will send test emails for both assignment and reassignment scenarios.

### Manual Testing
1. Create a new task and assign it to a user
2. Update an existing task's assignee
3. Check the recipient's email inbox for notifications

### Available Test Commands
- `npm run validate-gmail` - Check if Gmail credentials are working
- `npm run test-email` - Send test emails using Gmail
- `npm run test-email-demo` - Send test emails using Ethereal (for development)

## Email Flow Logic

### New Task Assignment
```
User creates task → Task assigned to user → Email sent to assignee
```

### Task Reassignment
```
User updates task assignee → Assignee changed → Email sent to new assignee
```

### Smart Filtering
- ❌ No email sent if user assigns task to themselves
- ❌ No email sent if assignee field is empty
- ✅ Email sent only when assignee is different from the person making the assignment

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check Gmail credentials in `.env` file
2. **Template not loading**: Verify HTML template syntax
3. **Wrong recipient**: Ensure user email exists in database

### Debug Logs
The system provides detailed console logs:
- 📧 Email sending attempts
- 👤 User lookup results  
- ✅ Success confirmations
- ❌ Error messages with stack traces

## Future Enhancements
- 📊 Email analytics and tracking
- 🔔 Additional notification types (comments, due dates, etc.)
- 🎨 Customizable email templates per workspace
- 📱 SMS notifications integration
- 🌐 Multi-language email support