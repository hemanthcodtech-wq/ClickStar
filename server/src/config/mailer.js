import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

export const getTransporter = () => {
  if (!transporter) {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.warn('⚠️ EMAIL_USER/EMAIL_PASS not configured in server/.env. Emails will be logged to console in test mode.');
    }
  }
  return transporter;
};

// 1. Send Signup Verification OTP
export const sendVerificationEmail = async (toEmail, otpCode, username = 'Creator') => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ClickStar" <no-reply@clickstar.app>',
    to: toEmail,
    subject: 'Verify your ClickStar account 🌟',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #0c0c0e; color: #ffffff; border-radius: 18px; border: 1px solid #26262b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">ClickStar ✨</h1>
          <p style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">Welcome to the creator community</p>
        </div>
        <div style="background-color: #151518; border: 1px solid #2a2a30; border-radius: 14px; padding: 26px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Hi ${username},</h2>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.5;">Thank you for joining ClickStar! Use the 6-digit verification code below to activate your account and claim your <strong>100 bonus ClickStars</strong>:</p>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #f43f5e; margin: 22px 0; padding: 14px 20px; background: #202026; border-radius: 10px; display: inline-block; border: 1px dashed #f43f5e55;">
            ${otpCode}
          </div>
          <p style="color: #71717a; font-size: 12px; margin-bottom: 0;">This code expires in <strong>10 minutes</strong>. If you did not sign up for ClickStar, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #52525b; font-size: 11px;">
          &copy; ${new Date().getFullYear()} ClickStar from ZEWOTECH. All rights reserved.
        </div>
      </div>
    `,
  };

  const client = getTransporter();
  if (client) {
    return client.sendMail(mailOptions);
  } else {
    console.log(`\n================== [OUTGOING EMAIL: SIGNUP OTP] ==================`);
    console.log(`📧 To: ${toEmail}`);
    console.log(`🔑 Verification Code: ${otpCode}`);
    console.log(`ℹ️  Configure EMAIL_USER and EMAIL_PASS in server/.env to send via SMTP`);
    console.log(`===================================================================\n`);
    return { mock: true, otpCode };
  }
};

// 2. Send Welcome Email upon successful signup verification
export const sendWelcomeEmail = async (toEmail, username = 'Creator') => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ClickStar" <no-reply@clickstar.app>',
    to: toEmail,
    subject: 'Welcome to ClickStar! You earned 100 ClickStars 🎉',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #0c0c0e; color: #ffffff; border-radius: 18px; border: 1px solid #26262b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">ClickStar ✨</h1>
          <p style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">Your account is ready</p>
        </div>
        <div style="background-color: #151518; border: 1px solid #2a2a30; border-radius: 14px; padding: 26px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Welcome aboard, @${username}! 🚀</h2>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">Your account has been verified. You've been rewarded with <strong>100 ClickStars</strong> to get started.</p>
          <div style="margin: 20px 0; padding: 12px; background: #202026; border-radius: 8px; color: #fbbf24; font-weight: bold; font-size: 14px;">
            ✨ Balance: 100 ClickStars
          </div>
          <p style="color: #a1a1aa; font-size: 13px;">Start posting photos, liking your favorite creators, and climbing the leaderboard!</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #52525b; font-size: 11px;">
          &copy; ${new Date().getFullYear()} ClickStar from ZEWOTECH.
        </div>
      </div>
    `,
  };

  const client = getTransporter();
  if (client) {
    return client.sendMail(mailOptions);
  } else {
    console.log(`\n================== [OUTGOING EMAIL: WELCOME] ==================`);
    console.log(`📧 To: ${toEmail}`);
    console.log(`🎉 Welcome email delivered for @${username}`);
    console.log(`================================================================\n`);
    return { mock: true };
  }
};

// 3. Send Password Reset OTP
export const sendPasswordResetEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ClickStar" <no-reply@clickstar.app>',
    to: toEmail,
    subject: 'Reset your ClickStar password 🔒',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #0c0c0e; color: #ffffff; border-radius: 18px; border: 1px solid #26262b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">ClickStar ✨</h1>
          <p style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">Password Reset Request</p>
        </div>
        <div style="background-color: #151518; border: 1px solid #2a2a30; border-radius: 14px; padding: 26px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.5;">We received a request to reset your password. Use the verification code below:</p>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #f59e0b; margin: 22px 0; padding: 14px 20px; background: #202026; border-radius: 10px; display: inline-block; border: 1px dashed #f59e0b55;">
            ${otpCode}
          </div>
          <p style="color: #71717a; font-size: 12px; margin-bottom: 0;">This code expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #52525b; font-size: 11px;">
          &copy; ${new Date().getFullYear()} ClickStar from ZEWOTECH.
        </div>
      </div>
    `,
  };

  const client = getTransporter();
  if (client) {
    return client.sendMail(mailOptions);
  } else {
    console.log(`\n================== [OUTGOING EMAIL: PASSWORD RESET OTP] ==================`);
    console.log(`📧 To: ${toEmail}`);
    console.log(`🔑 Reset Code: ${otpCode}`);
    console.log(`ℹ️  Configure EMAIL_USER and EMAIL_PASS in server/.env to send via SMTP`);
    console.log(`========================================================================\n`);
    return { mock: true, otpCode };
  }
};

// 4. Send Password Changed Confirmation Email
export const sendPasswordChangedConfirmation = async (toEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ClickStar" <no-reply@clickstar.app>',
    to: toEmail,
    subject: 'Your ClickStar password has been updated ✅',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #0c0c0e; color: #ffffff; border-radius: 18px; border: 1px solid #26262b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">ClickStar ✨</h1>
          <p style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">Security Notification</p>
        </div>
        <div style="background-color: #151518; border: 1px solid #2a2a30; border-radius: 14px; padding: 26px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Password Successfully Changed</h2>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.5;">This is a confirmation that your ClickStar password was recently updated.</p>
          <p style="color: #71717a; font-size: 12px; margin-top: 15px;">If you performed this action, no further steps are needed. If you did not make this change, please contact support immediately.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #52525b; font-size: 11px;">
          &copy; ${new Date().getFullYear()} ClickStar from ZEWOTECH.
        </div>
      </div>
    `,
  };

  const client = getTransporter();
  if (client) {
    return client.sendMail(mailOptions);
  } else {
    console.log(`\n================== [OUTGOING EMAIL: PASSWORD CHANGED] ==================`);
    console.log(`📧 To: ${toEmail}`);
    console.log(`✅ Password change confirmation email delivered.`);
    console.log(`=======================================================================\n`);
    return { mock: true };
  }
};
