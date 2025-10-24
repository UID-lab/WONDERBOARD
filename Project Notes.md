---

Setting up Gmail App Password
To send emails through Gmail, you need to create an App Password (not your regular Gmail password). Here's how:

Step 1: Enable 2-Factor Authentication
Go to your Google Account settings: https://myaccount.google.com/
Click on "Security" in the left sidebar
Enable "2-Step Verification" if not already enabled
Step 2: Create App Password
In the same Security section, look for "App passwords"
Click on "App passwords"
Select "Mail" as the app
Select "Other (custom name)" as the device
Enter "Wonder Board" as the name
Click "Generate"
Copy the 16-character password (it will look like: abcd efgh ijkl mnop)
Step 3: Update .env File
Replace your_gmail_app_password_here in the .env file with the app password you just generated:

EMAIL_USER=gilbertstanley311@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop

---
