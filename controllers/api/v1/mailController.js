const { v4: uuidv4 } = require('uuid');
const Business = require('../../../models/api/v1/Business');
const User = require('../../../models/api/v1/User');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, htmlContent) => {
    try {
        const msg = {
            to,
            from: 'hello@kroo.site',
            subject,
            text,
            html: htmlContent,
        };
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const generateRandomCode = () => {
    const uuid = uuidv4(); // generate a UUID
    const truncatedCode = uuid.replace(/-/g, '').slice(0, 8); // remove hyphens and take first 8 characters
    return truncatedCode;
};

const sendEmailToEmployees = async (employees, business) => {
    try {
        // send email to each employee
        for (const employee of employees) {
            const emailContent = `You have been invited to ${business.name} as ${employee.role}. Your invitation code is: ${generateRandomCode()}`;
            await sendEmail(employee.email, 'Invitation to the Business', emailContent);
            console.log(`Email sent to ${employee.email}`);
        }
        console.log('Emails sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const sendInvite = async (req, res) => {
    try {
        const businessId = req.params.id; // extracting business ID from URL params
        console.log(`Sending invites for business ID: ${businessId}`);

        // fetch business information
        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // extract emails and roles from request body
        const { invitations } = req.body;

        // construct email content for each invitation
        const emailPromises = invitations.map(invitation => {
            const { email, role } = invitation;
            const emailContent = `You have been invited to ${business.name} as ${role}. Your invitation code is: ${generateRandomCode()}`;
            return sendEmail(email, 'Invitation to the Business', emailContent);
        });

        // send invitation emails to all employees
        await Promise.all(emailPromises);

        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const sendPasswordResetEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const resetToken = generateRandomCode(); // generate reset token
        const resetLink = `http://kroo.site/reset-password?token=${resetToken}`;
        
        // construct email content
        const emailContent = `
            <p>You have requested a password reset. Please click the following link to reset your password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>If you did not request this password reset, please do the following:</p>
            <ol>
                <li>Do not click on the reset password link.</li>
                <li>Secure your account by updating your password immediately using a strong and unique password.</li>
                <li>Contact our support team at hello@kroo.site if you have any concerns or questions.</li>
            </ol>
        `;

        // send email to user
        await sendEmail(email, 'Password Reset Request', 'Password Reset Request', emailContent); 
        console.log(`Password reset email sent to ${email}`);
        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    sendEmailToEmployees,
    sendInvite,
    sendPasswordResetEmail
};