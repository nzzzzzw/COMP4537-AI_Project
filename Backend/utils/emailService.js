const nodemailer = require('nodemailer');

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    secure: false,
    auth: {
        user: 'MS_s4FrRD@trial-7dnvo4d5qdnl5r86.mlsender.net',
        pass: 'mssp.OrKYkma.3vz9dlejx2q4kj50.yDDmfMS'
    },
    tls: {
        rejectUnauthorized: false // Only for development
    }
});

const sendResetPasswordEmail = async (email, resetUrl) => {
    const mailOptions = {
        from: {
            name: 'Mental Health App',
            address: 'MS_s4FrRD@trial-7dnvo4d5qdnl5r86.mlsender.net'
        },
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link will expire in 10 minutes.</p>
            
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Mental Health App Team</p>
        `
    };

    try {
        // Verify connection configuration
        await transporter.verify();
        console.log('SMTP connection verified');
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending reset password email');
    }
};

module.exports = { sendResetPasswordEmail };