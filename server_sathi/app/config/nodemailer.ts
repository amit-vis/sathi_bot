import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com', // Optional: host aur port define karna stable rehta hai
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.PASSKEY!,
  },
});


const sendMail = async (from: string, to: string, subject: string, text: string, html: string) => {
  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendOTPResponse = async (to: string, otp:string) => {
    try {
        const subject = "Your Verification Code for Sathi"
        const htmlContent = `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sathi Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #4f46e5; padding: 30px 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">Sathi</h1>
                            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Aapka Apna Digital Sathi</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #333333;">
                            <h2 style="margin-top: 0; font-size: 20px; color: #1f2937;">Hello,</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                                We received a request to verify your account on <b>Sathi</b>. Please use the One-Time Password (OTP) below to complete your process.
                            </p>

                            <!-- OTP Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background-color: #f3f4f6; color: #1f2937; display: inline-block; padding: 15px 40px; font-size: 32px; font-weight: 700; letter-spacing: 6px; border-radius: 6px; border: 1px dashed #d1d5db;">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin-bottom: 20px;">
                                This OTP is valid for the next <b>10 minutes</b>. Please do not share this code with anyone for security reasons.
                            </p>

                            <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin-bottom: 0;">
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                &copy; 2026 Sathi. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
 
        await sendMail(process.env.EMAIL_USER!, to, subject, "", htmlContent);
    } catch (error) {
        console.error('Error sending query response email:', error);
    }
}

const onboardMail = async ( to: string) => {
  try {
    const subject = `Welcome to Sathi! Your account has been successfully created 🎉`;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Sathi</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #4f46e5; padding: 30px 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">Sathi</h1>
                            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Aapka Apna Digital Sathi</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #333333;">
                            <h2 style="margin-top: 0; font-size: 22px; color: #1f2937;">Welcome aboard, [USER_NAME]! 👋</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                                Thank you for signing up with <b>Sathi</b>. Your account has been successfully verified and is now ready to use. We are thrilled to have you with us!
                            </p>

                            <!-- Feature Box / Highlight -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-left: 4px solid #4f46e5; margin: 25px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">
                                            You can now explore all features and manage your workspace seamlessly.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="[DASHBOARD_URL]" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 30px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block; box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin-bottom: 0;">
                                If you have any questions or need support, feel free to reach out to us. We're always here to help!
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                &copy; 2026 Sathi. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    await sendMail(process.env.EMAIL_USER!, to, subject, "", htmlContent);
  } catch (error) {
    console.error('Error sending acknowledgment email:', error);
  }
}

export { sendOTPResponse, onboardMail };