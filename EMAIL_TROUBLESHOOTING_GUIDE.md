# Email Troubleshooting Guide

## ✅ Current Status
Your email system is **WORKING CORRECTLY**! 

- ✅ Gmail credentials are valid
- ✅ SMTP connection successful  
- ✅ Test emails sent successfully
- ✅ Email templates are beautiful and responsive
- ✅ Integration with task service is complete

## 📧 Email Sending Triggers

Emails are automatically sent in these scenarios:

### 1. **New Task Assignment**
- **When**: You create a new task and assign it to a user
- **Condition**: Assignee must be different from the person creating the task
- **Email Type**: 🎯 Task Assignment (blue gradient)

### 2. **Task Reassignment** 
- **When**: You update an existing task's assignee to a different user
- **Condition**: New assignee must be different from the person making the change
- **Email Type**: 🔄 Task Reassignment (pink gradient)

## 🔍 How to Test in Your Application

### Test 1: Create New Task with Assignment
1. Log into your Wonder Board application
2. Create a new task
3. Assign it to a different user (not yourself)
4. Check the backend console logs for email sending messages
5. Check the assignee's Gmail inbox

### Test 2: Reassign Existing Task
1. Find an existing task
2. Change the assignee to a different user
3. Check console logs and the new assignee's email

## 📋 Console Log Messages to Look For

When emails are sent, you'll see these messages in your backend console:

```
🔍 Task assigned to: [user_id]
👤 Assignee found: { id: ..., name: ..., email: ... }
👤 Creator found: { id: ..., name: ..., email: ... }
📧 Sending task assignment email asynchronously...
📧 Using Gmail SMTP for email delivery
📧 Gmail email sent successfully!
📧 From: "Wonder Board - [Name]" <gilbertstanley311@gmail.com>
📧 To: [assignee_email]
📧 Subject: 🎯 New Task Assigned: [Task Title]
✅ Email sent successfully
```

## 🚫 When Emails Are NOT Sent

Emails will NOT be sent in these cases:
- ❌ User assigns task to themselves
- ❌ Task has no assignee
- ❌ Assignee email not found in database
- ❌ Gmail credentials are invalid

## 🔧 Quick Tests You Can Run

### Test Gmail Connection
```bash
cd backend
npm run validate-gmail
```

### Send Test Email to Yourself
```bash
cd backend
npm run test-real-email
```

### Send Test Email to Any Address
Edit `backend/src/scripts/test-real-email.ts` and change the email address, then run:
```bash
npm run test-real-email
```

## 📱 Check Your Gmail

The emails are sent from: **gilbertstanley311@gmail.com**

**Subject Lines:**
- 🎯 New Task Assigned: [Task Title]
- 🔄 Task Reassigned: [Task Title]

**Email Features:**
- Beautiful HTML design with gradients
- Responsive layout for mobile/desktop
- Direct link to workspace
- Task details and description
- Professional branding

## 🐛 Common Issues & Solutions

### Issue: "No emails in inbox"
**Solutions:**
1. Check spam/junk folder
2. Verify assignee email exists in user database
3. Check backend console logs for error messages
4. Ensure you're not assigning tasks to yourself

### Issue: "Authentication failed"
**Solutions:**
1. Verify Gmail App Password is correct
2. Ensure 2FA is enabled on Gmail account
3. Regenerate App Password if needed

### Issue: "Emails not triggering"
**Solutions:**
1. Check that assignee ≠ task creator
2. Verify task has an assignee
3. Check backend server is running
4. Look for error messages in console

## 📞 Support

If emails still aren't working:
1. Check the backend console logs when creating/updating tasks
2. Verify the assignee's email address is correct
3. Test with `npm run test-real-email` to confirm Gmail is working
4. Make sure you're testing with different users (not assigning to yourself)

## 🎯 Next Steps

Your email system is ready! Just:
1. Create tasks and assign them to users
2. Update task assignees 
3. Check Gmail inboxes for the beautiful notification emails

The system will automatically send emails whenever tasks are assigned or reassigned to different users.