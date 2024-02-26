const nodemailer = require('nodemailer');
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

// function to send email to invited employees
const sendInvite = async (req, res) => {
    try {
        const businessId = req.params.id;
        const employees = req.body;

        // retrieve business name based on businessId
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        const businessName = business.name;

        console.log(`Sending invites for business ID: ${businessId}`);

        await sendEmailToEmployees(employees, businessName);
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// function to send email to invited employees when business is created
const sendEmailToEmployees = async (employees, businessName) => {
    try {
        // send email to each employee
        for (const employee of employees) {
            const emailContent = `You have been invited to ${businessName} as ${employee.role}`;
            await transporter.sendMail({
                from: 'hello@kroo.site',
                to: employee.email,
                subject: 'Invitation to Join Business',
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