const Job = require('../../../models/api/v1/Jobs');
const JobApplication = require('../../../models/api/v1/JobApplication');
const { User } = require('../../../models/api/v1/User');
const { sendApplicationMail } = require('./mailController');
const Business = require('../../../models/api/v1/Business');
const jwt = require('jsonwebtoken');

// apply for job
const applyJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        // check if jobId is provided
        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }

        // find job by ID
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // extract JWT token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is missing' });
        }
        const token = authHeader;

        // decode the token to get user ID
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // verify that the user ID from the token matches the one in the request
        if (userId !== decodedToken.userId) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        // check if user has already applied for job
        const applicationExists = await JobApplication.findOne({ job: jobId, user: userId });
        if (applicationExists) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // find business associated with job
        const business = await Business.findById(job.businessId);
        if (!business) {
            throw new Error('Business not found');
        }

        // create new application
        const application = new JobApplication({
            job: jobId,
            user: userId,
            date: new Date(),
            status: 'pending'
        });

        // save job application
        await application.save();

        // add application to job
        job.applications.push(application);
        await job.save();

        // find user
        const user = await User.findById(userId);
        user.userJobs.applications.push(application);
        await user.save();

        // send application email to business
        await sendApplicationMail(job, user, business);

        const populatedJob = await Job.findById(jobId).populate('applications');

        res.status(201).json({ message: 'Job application submitted successfully', job: populatedJob });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// delete job application
const deleteJobApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        if (!applicationId) {
            return res.status(400).json({ message: 'Application ID is required' });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Job application not found' });
        }

        if (application.user.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this application' });
        }

        const job = await Job.findById(application.job);
        job.applications.pull(applicationId);
        await job.save();

        const user = await User.findById(userId);
        user.userJobs.applications.pull(applicationId);
        await user.save();

        await JobApplication.findByIdAndDelete(applicationId);

        res.status(200).json({ message: 'Job application deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    applyJob,
    deleteJobApplication
};