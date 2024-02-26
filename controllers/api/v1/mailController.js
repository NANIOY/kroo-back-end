const nodemailer = require('nodemailer');

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
        
        console.log(`Sending invites for business ID: ${businessId}`);

        await sendEmailToEmployees(employees);
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// function to send email to invited employees when business is created
const sendEmailToEmployees = async (employees) => {
    try {
        // send email to each employee
        for (const employee of employees) {
            await transporter.sendMail({
                from: 'hello@kroo.site',
                to: employee.email,
                subject: 'Subject of the email',
                text: 'Body of the email'
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