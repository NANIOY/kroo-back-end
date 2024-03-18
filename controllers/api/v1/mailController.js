const { v4: uuidv4 } = require('uuid');
const Business = require('../../../models/api/v1/Business');
const { User } = require('../../../models/api/v1/User');
const { CustomError } = require('../../../middlewares/errorHandler');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// general email send
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
        throw new CustomError('Error sending email', 500);
    }
};

// generate random code
const generateRandomCode = () => {
    const uuid = uuidv4(); // generate a UUID
    const truncatedCode = uuid.replace(/-/g, '').slice(0, 8); // remove hyphens and take first 8 characters
    return truncatedCode;
};

// send email to employees
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
        throw new CustomError('Error sending email', 500);
    }
};

// send separate invite
const sendInvite = async (req, res, next) => {
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
        next(error);
    }
};

// send join request
const sendJoinRequest = async (business) => {
    try {
        if (!business) {
            throw new Error('Business not found');
        }

        const companyEmail = business.businessInfo.companyEmail;
        const invitationCode = generateRandomCode();
        const emailContent = `You have received a request to join ${business.name}. Use the invitation code "${invitationCode}" to accept the request.`;

        await sendEmail(companyEmail, 'Join Request', emailContent);
        console.log('Join request email sent successfully');
    } catch (error) {
        console.error('Error sending join request email:', error);
        throw new CustomError('Error sending join request email', 500);
    }
};

// send password reset email
const sendPasswordResetEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        // check if email exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        };

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
        next(error);
    }
};

// send application email
const sendApplicationMail = async (job, user, business) => {
    try {
        // Ensure user details are available
        if (!user || !user.username || !user.email) {
            throw new Error('User details are missing or incomplete');
        }

        // Construct email content
        const emailContent = `
            Hello ${business.name},<br><br>

            ${user.username} has applied for the job "${job.title}".<br><br>

            You can review your applications at ${job.url}.<br><br>

            Kind regards,<br>
            kroo
        `;

        // Send email
        await sendEmail(business.businessInfo.companyEmail, `New Application for ${job.title}`, 'New Job Application', emailContent);
        console.log(`Application email sent successfully to ${business.businessInfo.companyEmail}`);
    } catch (error) {
        throw new CustomError('Error sending application email', 500);
    }
};

// send job offer email
const sendJobOfferEmail = async (to, user, business) => {
    try {
        console.log('User object:', user);
        const emailContent = `
            Hello ${user.username},<br><br>
        
            You've received a job offer from ${business.name}. <br><br>
        
            You can view the job offer at http://kroo.site/tracker.<br><br>
        
            Kind regards,<br>
            kroo
        `;

        await sendEmail(to, `Job Offer from ${business.name}`, emailContent, emailContent); // pass emailContent as both text and HTML

        console.log('Job offer email sent successfully');
    } catch (error) {
        throw new CustomError('Error sending job offer email', 500);
    }
};

module.exports = {
    sendEmailToEmployees,
    sendInvite,
    sendJoinRequest,
    sendPasswordResetEmail,
    sendApplicationMail,
    sendJobOfferEmail
};