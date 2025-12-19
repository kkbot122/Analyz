import { Resend } from "resend"; // or your email service

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({
  to,
  orgName,
  role,
  projectName,
  token,
  expiresAt,
}: {
  to: string;
  orgName: string;
  role: string;
  projectName?: string;
  token: string;
  expiresAt: Date;
}) {
  try {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`;
    const expiresInDays = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const subject = projectName 
      ? `Join ${projectName} on ${orgName}`
      : `Join ${orgName}`;

    await resend.emails.send({
      from: "Acme <invites@acme.com>",
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              background-color: #000; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>You're Invited!</h2>
            <p>You've been invited to join <strong>${orgName}</strong> as a <strong>${role.toLowerCase().replace('_', ' ')}</strong>.</p>
            
            ${projectName ? `<p>Specifically, you're invited to the project: <strong>${projectName}</strong></p>` : ''}
            
            <p>Click the button below to accept your invitation:</p>
            
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
            
            <p>Or copy and paste this link in your browser:<br>
            <small>${inviteUrl}</small></p>
            
            <p><strong>This invite expires in ${expiresInDays} days.</strong></p>
            
            <div class="footer">
              <p>If you didn't request this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send invite email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail({
  to,
  userName,
  orgName,
  role,
  projectName,
}: {
  to: string;
  userName: string;
  orgName: string;
  role: string;
  projectName?: string;
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    await resend.emails.send({
      from: "Acme <welcome@acme.com>",
      to,
      subject: `Welcome to ${orgName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              background-color: #000; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to ${orgName}, ${userName}!</h2>
            <p>You've been added to <strong>${orgName}</strong> as a <strong>${role.toLowerCase().replace('_', ' ')}</strong>.</p>
            
            ${projectName ? `<p>You also have access to the project: <strong>${projectName}</strong></p>` : ''}
            
            <p>You can now access your dashboard:</p>
            
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            
            <p>If you have any questions, please contact your organization admin.</p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}