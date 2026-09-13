import dns from 'dns';
dns.setDefaultResultOrder('ipv4first'); 

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
    auth: {
        user: process.env.SMTP2GO_USER,  // SMTP username (email jaisa hota hai)
        pass: process.env.SMTP2GO_PASS,  // SMTP password ya API key
    },
});
// const transporter = nodemailer.createTransport({
//   host: 'smtp.sendgrid.net',
//   port: 2525,
//   auth: {
//     user: 'apikey',
//     pass: process.env.SENDGRID_KEY,
//   },
//   tls: { rejectUnauthorized: false }
// });

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

const sendOTPResponse = async (to: string, otp: string) => {
    try {
        const subject = "Your Verification Code for BizNest"
        const htmlContent = `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BizNest Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #4f46e5; padding: 30px 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">BizNest</h1>
                            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Aapka Apna Digital BizNest</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #333333;">
                            <h2 style="margin-top: 0; font-size: 20px; color: #1f2937;">Hello,</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                                We received a request to verify your account on <b>BizNest</b>. Please use the One-Time Password (OTP) below to complete your process.
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
                                &copy; 2026 BizNest. All rights reserved.
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

        await sendMail("BizNest <amv@ergontec.com>", to, subject, "", htmlContent);
    } catch (error) {
        console.error('Error sending query response email:', error);
    }
}

const onboardMail = async (to: string, userName: string) => {
    try {
        const subject = `Welcome to BizNest! Your account has been successfully created 🎉`;
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to BizNest</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #4f46e5; padding: 30px 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">BizNest</h1>
                            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Aapka Apna Digital BizNest</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #333333;">
                            <h2 style="margin-top: 0; font-size: 22px; color: #1f2937;">Welcome aboard, ${userName}! 👋</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                                Thank you for signing up with <b>BizNest</b>. Your account has been successfully verified and is now ready to use. We are thrilled to have you with us!
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
                                        <a href="https://sathi-bot.vercel.app/signin" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 30px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block; box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);">
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
                                &copy; 2026 BizNest. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
        await sendMail("BizNest <amv@ergontec.com>", to, subject, "", htmlContent);
    } catch (error) {
        console.error('Error sending acknowledgment email:', error);
    }
}

const accountDeleteMail = async (to: string, userName: string) => {
    try {
        const purgeDate = new Date();
        purgeDate.setDate(purgeDate.getDate() + 15);
        const formattedDate = purgeDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        const subject = `Your BizNest account has been scheduled for deletion`;
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Account Deletion - BizNest</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #dc2626; padding: 30px 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">BizNest</h1>
                            <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 14px;">Account Deletion Notice</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #333333;">
                            <h2 style="margin-top: 0; font-size: 20px; color: #1f2937;">Hi ${userName || "there"},</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                                We're sorry to see you go. As per your request, your <b>BizNest</b> account has been scheduled for permanent deletion.
                            </p>

                            <!-- Warning Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-left: 4px solid #dc2626; margin: 25px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0 0 8px 0; font-size: 15px; color: #991b1b; font-weight: 600;">
                                            ⚠️ What happens next?
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                                            Your account and all associated data (processed emails, credits, settings) will be <b>permanently deleted on ${formattedDate}</b>. After this date, recovery will not be possible.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Recovery Window Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-left: 4px solid #16a34a; margin: 25px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0 0 8px 0; font-size: 15px; color: #166534; font-weight: 600;">
                                            ✅ Changed your mind?
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #15803d; line-height: 1.5;">
                                            You have <b>15 days</b> (until ${formattedDate}) to recover your account. Simply contact us and we'll restore everything — no data will be lost.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Contact Options -->
                            <p style="font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">
                                To recover your account, contact us:
                            </p>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                                <!-- WhatsApp -->
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                                            <tr>
                                                <td style="padding: 12px 16px;">
                                                    <p style="margin: 0; font-size: 14px; color: #374151;">
                                                        <b style="color: #16a34a;">WhatsApp:</b>
                                                        <a href="https://wa.me/917580946569" target="_blank" style="color: #4f46e5; text-decoration: none; margin-left: 8px;">7580946569</a>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Email -->
                                <tr>
                                    <td style="padding: 0;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                                            <tr>
                                                <td style="padding: 12px 16px;">
                                                    <p style="margin: 0; font-size: 14px; color: #374151;">
                                                        <b style="color: #4f46e5;">Email:</b>
                                                        <a href="mailto:amit200698@hotmail.com" style="color: #4f46e5; text-decoration: none; margin-left: 8px;">amit200698@hotmail.com</a>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Deadline Reminder -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background-color: #f3f4f6; color: #1f2937; display: inline-block; padding: 15px 40px; font-size: 16px; font-weight: 600; letter-spacing: 1px; border-radius: 6px; border: 1px dashed #d1d5db;">
                                            Recovery Deadline: ${formattedDate}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin-top: 25px; margin-bottom: 0;">
                                We truly appreciate the time you spent with BizNest. If there's anything we could have done better, please let us know — your feedback helps us improve for everyone.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #9ca3af;">
                                You're receiving this email because you requested account deletion on BizNest.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                &copy; 2026 BizNest. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        await sendMail("BizNest <amv@ergontec.com>", to, subject, "", htmlContent);
    } catch (error) {
        console.error("Error sending account deletion email:", error);
    }
};

export { sendOTPResponse, onboardMail, accountDeleteMail };