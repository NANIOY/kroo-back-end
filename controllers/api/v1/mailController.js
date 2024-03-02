const { v4: uuidv4 } = require('uuid');
const Business = require('../../../models/api/v1/Business');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
    try {
        const msg = {
            to,
            from: 'hello@kroo.site',
            subject,
            text,
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

module.exports = {
    sendEmailToEmployees,
    sendInvite
};