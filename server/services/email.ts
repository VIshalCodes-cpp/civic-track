import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;

if (!SENDGRID_API_KEY || !FROM_EMAIL) {
  console.warn('SendGrid not fully configured. OTP emails will be logged to the server console only.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendEmailOTP(email: string, code: string): Promise<boolean> {
  // Development fallback: if SendGrid is not configured, just log the OTP and pretend success
  if (!SENDGRID_API_KEY || !FROM_EMAIL) {
    console.log(`📧 DEV OTP for ${email}: ${code}`);
    return true;
  }

  try {
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: 'prejectv1 - Verification Code',
      html: `
        <div style="font-family: Arial; text-align: center;">
          <h2>Your OTP Code</h2>
          <h1 style="color: #2c3e50;">${code}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    };

    await sgMail.send(msg);

    console.log("✅ Email sent successfully");
    return true;
  } catch (error: any) {
    console.error("❌ SendGrid error:", error.response?.body || error);
    return false;
  }
}

