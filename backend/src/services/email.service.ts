import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    // For development, we'll use a test SMTP service (Ethereal Email)
    // This creates real emails that you can view in a web interface

    let transporter;

    // Always use Gmail for real email delivery
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
        process.env.EMAIL_USER.trim() !== '' && process.env.EMAIL_PASS.trim() !== '') {
      // Use Gmail SMTP
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log("📧 Using Gmail SMTP for email delivery");
    } else {
      // Fallback to Ethereal for testing if Gmail credentials not provided
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("⚠️  Gmail credentials not found, using Ethereal for testing");
    }

    const info = await transporter.sendMail({
      from: options.from || 
        process.env.EMAIL_FROM || '"Wonder Board" <noreply@wonderboard.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log("📧 Gmail email sent successfully!");
      console.log("📧 From:", options.from);
      console.log("📧 To:", options.to);
      console.log("📧 Subject:", options.subject);
      console.log("📧 Message ID:", info.messageId);
    } else {
      console.log("📧 Test email sent successfully!");
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
      console.log("📧 To:", options.to);
      console.log("📧 Subject:", options.subject);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: !(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        ? nodemailer.getTestMessageUrl(info)
        : null,
    };
  } catch (error: any) {
    console.error("❌ Email sending failed:", error);
    
    // Provide helpful error messages for common Gmail issues
    if (error.code === 'EAUTH') {
      console.error("🔐 Gmail Authentication Failed!");
      console.error("📝 Please check:");
      console.error("   1. EMAIL_USER is correct in .env file");
      console.error("   2. EMAIL_PASS is a valid Gmail App Password (not regular password)");
      console.error("   3. 2-Factor Authentication is enabled on your Gmail account");
      console.error("   4. App Password was generated specifically for this app");
      console.error("📖 See GMAIL_SETUP_GUIDE.md for detailed setup instructions");
    }
    
    return { success: false, error };
  }
};

export const sendTaskAssignmentEmail = async (
  assigneeEmail: string,
  assigneeName: string,
  taskTitle: string,
  taskDescription: string,
  assignedBy: string,
  assignedByEmail: string,
  workspaceId: string,
  taskId: string
) => {
  const subject = `🎯 New Task Assigned: ${taskTitle}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Assignment Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 36px; color: white;">🎯</span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    New Task Assigned!
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
                    You have a new task waiting for you
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
                <!-- Greeting -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 10px; font-size: 24px; font-weight: 600;">
                        Hi ${assigneeName}! 👋
                    </h2>
                    <p style="color: #4a5568; margin: 0; font-size: 16px;">
                        <strong>${assignedBy}</strong> has assigned you a new task in your workspace.
                    </p>
                </div>

                <!-- Task Card -->
                <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                    <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">📋</span>
                        ${taskTitle}
                    </h3>
                    <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 3px solid #667eea;">
                        <p style="color: #4a5568; margin: 0; font-size: 15px; line-height: 1.6;">
                            ${taskDescription || "No description provided."}
                        </p>
                    </div>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/workspace/${workspaceId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                        🚀 View Task in Workspace
                    </a>
                </div>

                <!-- Additional Info -->
                <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h4 style="color: #2d3748; margin: 0 0 10px; font-size: 16px; font-weight: 600;">
                        📌 Quick Actions:
                    </h4>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px; font-size: 14px;">
                        <li style="margin-bottom: 5px;">Click the button above to view the full task details</li>
                        <li style="margin-bottom: 5px;">Update the task status as you make progress</li>
                        <li style="margin-bottom: 5px;">Add comments or ask questions if needed</li>
                    </ul>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f7fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #718096; margin: 0 0 10px; font-size: 14px;">
                    This email was sent from <strong>Wonder Board</strong>
                </p>
                <p style="color: #a0aec0; margin: 0; font-size: 12px;">
                    If you have any questions, please contact your workspace administrator.
                </p>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; margin: 0; font-size: 11px;">
                        Assigned by: ${assignedBy} (${assignedByEmail})
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail({
    from: `"Wonder Board - ${assignedBy}" <${process.env.EMAIL_USER}>`,
    to: assigneeEmail,
    subject,
    html,
  });
};

export const sendTaskReassignmentEmail = async (
  assigneeEmail: string,
  assigneeName: string,
  taskTitle: string,
  taskDescription: string,
  reassignedBy: string,
  reassignedByEmail: string,
  workspaceId: string,
  taskId: string
) => {
  const subject = `🔄 Task Reassigned: ${taskTitle}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reassignment Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 36px; color: white;">🔄</span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Task Reassigned!
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
                    A task has been reassigned to you
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
                <!-- Greeting -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 10px; font-size: 24px; font-weight: 600;">
                        Hi ${assigneeName}! 👋
                    </h2>
                    <p style="color: #4a5568; margin: 0; font-size: 16px;">
                        <strong>${reassignedBy}</strong> has reassigned a task to you in your workspace.
                    </p>
                </div>

                <!-- Task Card -->
                <div style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); border: 1px solid #feb2b2; border-radius: 12px; padding: 25px; margin: 25px 0; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></div>
                    <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">📋</span>
                        ${taskTitle}
                    </h3>
                    <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 3px solid #f093fb;">
                        <p style="color: #4a5568; margin: 0; font-size: 15px; line-height: 1.6;">
                            ${taskDescription || "No description provided."}
                        </p>
                    </div>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/workspace/${workspaceId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4); transition: all 0.3s ease;">
                        🚀 View Task in Workspace
                    </a>
                </div>

                <!-- Additional Info -->
                <div style="background-color: #fff5f5; border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h4 style="color: #2d3748; margin: 0 0 10px; font-size: 16px; font-weight: 600;">
                        📌 What's Next:
                    </h4>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px; font-size: 14px;">
                        <li style="margin-bottom: 5px;">Review the task details and requirements</li>
                        <li style="margin-bottom: 5px;">Update the task status as you work on it</li>
                        <li style="margin-bottom: 5px;">Reach out to the team if you need clarification</li>
                    </ul>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f7fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #718096; margin: 0 0 10px; font-size: 14px;">
                    This email was sent from <strong>Wonder Board</strong>
                </p>
                <p style="color: #a0aec0; margin: 0; font-size: 12px;">
                    If you have any questions, please contact your workspace administrator.
                </p>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; margin: 0; font-size: 11px;">
                        Reassigned by: ${reassignedBy} (${reassignedByEmail})
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail({
    from: `"Wonder Board - ${reassignedBy}" <${process.env.EMAIL_USER}>`,
    to: assigneeEmail,
    subject,
    html,
  });
};
