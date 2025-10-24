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
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
  } catch (error) {
    console.error("❌ Email sending failed:", error);
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
  const subject = `New Task Assigned: ${taskTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">You've been assigned a new task !</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">${taskTitle}</h3>
        <p style="color: #6c757d; margin-bottom: 0;">${
          taskDescription || "No description provided."
        }</p>
      </div>
      
      <p>Hi ${assigneeName},</p>
      <p>${assignedBy} has assigned you a new task in your workspace.</p>
      
      <div style="margin: 30px 0;">
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/workspace/${workspaceId}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Task
        </a>
      </div>
      
      <p style="color: #6c757d; font-size: 14px;">
        This email was sent from Wonder Board. If you have any questions, please contact your workspace administrator.
      </p>
    </div>
  `;

  return await sendEmail({
    from: `"${assignedBy}" <${assignedByEmail}>`,
    to: assigneeEmail,
    subject,
    html,
  });
};
