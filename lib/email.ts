import Courier from '@trycourier/courier';

// Initialize Courier client
const courier = new Courier({
  apiKey: process.env.COURIER_API_KEY!,
});

// Types
interface InviteEmailParams {
  to: string;
  orgName: string;
  role: string;
  projectName?: string;
  token: string;
  expiresAt: Date;
}

interface WelcomeEmailParams {
  to: string;
  userName: string;
  orgName: string;
  role: string;
  projectName?: string;
}

/**
 * Send invite email to new users
 */
export async function sendInviteEmail(params: InviteEmailParams) {
  try {
    console.log("🔧 Sending invite email via Courier...");
    console.log("🔧 Environment check:", {
      hasApiKey: !!process.env.COURIER_API_KEY,
      hasInviteTemplate: !!process.env.COURIER_TEMPLATE_INVITE,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
    });
    
    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/accept?token=${params.token}`;
    const expiresAtFormatted = params.expiresAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log("📧 Courier request payload:", {
      to: params.to,
      template: process.env.COURIER_TEMPLATE_INVITE,
      data: {
        orgName: params.orgName,
        role: params.role,
        projectName: params.projectName || '',
        inviteUrl,
      }
    });

    const response = await courier.send.message({
      message: {
        to: { 
          user_id: params.to, // Use user_id or email based on Courier's preference
          email: params.to 
        },
        template: process.env.COURIER_TEMPLATE_INVITE!,
        data: {
          orgName: params.orgName,
          role: params.role,
          projectName: params.projectName || '',
          inviteUrl,
          expiresAt: expiresAtFormatted,
          year: new Date().getFullYear(),
        },
      },
    });

    console.log('✅ Courier: Invite email sent successfully:', response.requestId);
    return { success: true, requestId: response.requestId };
  } catch (error: any) {
    console.error('❌ Courier invite error:', error.message);
    console.error('Full error:', error);
    
    // Fallback for development
    console.log('📧 [DEV FALLBACK] Invite email details:', {
      to: params.to,
      orgName: params.orgName,
      role: params.role,
      projectName: params.projectName,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/accept?token=${params.token}`,
    });
    
    // In development, don't fail - just log
    if (process.env.NODE_ENV === 'development') {
      return { 
        success: true, 
        devMode: true, 
        message: 'Email would be sent in production',
        details: {
          to: params.to,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/accept?token=${params.token}`,
        }
      };
    }
    
    throw new Error(`Failed to send invite email: ${error.message}`);
  }
}

/**
 * Send welcome email to existing users
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams) {
  try {
    console.log("🔧 Sending welcome email via Courier...");
    
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`;

    const response = await courier.send.message({
      message: {
        to: { 
          user_id: params.to,
          email: params.to 
        },
        template: process.env.COURIER_TEMPLATE_WELCOME!,
        data: {
          userName: params.userName,
          orgName: params.orgName,
          role: params.role,
          projectName: params.projectName || '',
          dashboardUrl,
          year: new Date().getFullYear(),
        },
      },
    });

    console.log('✅ Courier: Welcome email sent successfully:', response.requestId);
    return { success: true, requestId: response.requestId };
  } catch (error: any) {
    console.error('❌ Courier welcome error:', error.message);
    
    // Fallback for development
    console.log('📧 [DEV FALLBACK] Welcome email details:', {
      to: params.to,
      userName: params.userName,
      orgName: params.orgName,
      role: params.role,
      projectName: params.projectName,
    });
    
    // In development, don't fail
    if (process.env.NODE_ENV === 'development') {
      return { 
        success: true, 
        devMode: true, 
        message: 'Email would be sent in production' 
      };
    }
    
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
}

/**
 * Test Courier configuration
 */
export async function testCourierConfig() {
  try {
    console.log("🧪 Testing Courier configuration...");
    
    // Test by sending a test notification
    const testEmail = 'test@example.com';
    
    const result = await sendInviteEmail({
      to: testEmail,
      orgName: 'Test Organization',
      role: 'TEAM_MEMBER',
      token: 'test-token-123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    return { 
      success: true, 
      message: 'Courier test email sent (check Courier dashboard)',
      result,
      env: {
        hasApiKey: !!process.env.COURIER_API_KEY,
        hasInviteTemplate: !!process.env.COURIER_TEMPLATE_INVITE,
        hasWelcomeTemplate: !!process.env.COURIER_TEMPLATE_WELCOME,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
      },
    };
  } catch (error: any) {
    console.error("🧪 Courier test failed:", error);
    return { 
      success: false, 
      error: error.message,
      env: {
        hasApiKey: !!process.env.COURIER_API_KEY,
        hasInviteTemplate: !!process.env.COURIER_TEMPLATE_INVITE,
        hasWelcomeTemplate: !!process.env.COURIER_TEMPLATE_WELCOME,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
      }
    };
  }
}