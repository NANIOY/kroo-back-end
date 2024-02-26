const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const Business = require('../../../models/api/v1/Business');

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const generateRandomCode = () => {
    const uuid = uuidv4(); // Generate a UUID
    const truncatedCode = uuid.replace(/-/g, '').slice(0, 8); // remove hyphens and take first 8 characters
    return truncatedCode;
};

// function to send email to invited employees
const sendInvite = async (req, res) => {
    try {
        const businessId = req.params.id;
        const employees = req.body;
        
        console.log(`Sending invites for business ID: ${businessId}`);

        // fetch business information
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        await sendEmailToEmployees(employees, business);
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// function to send email to invited employees when business is created
const sendEmailToEmployees = async (employees, business) => {
    try {
        // send email to each employee
        for (const employee of employees) {
            const randomCode = generateRandomCode();
            const emailContent = `You have been invited to ${business.name} as ${employee.role}. Your invitation code is: ${randomCode}`;
            await transporter.sendMail({
                from: 'hello@kroo.site',
                to: employee.email,
                subject: 'Invitation to the Business',
                text: emailContent
            });
        }
        console.log('Emails sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendInvite,
    sendEmailToEmployees
};