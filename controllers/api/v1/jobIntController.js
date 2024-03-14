const Job = require('../../../models/api/v1/Jobs');
const JobApplication = require('../../../models/api/v1/JobApplication');
const { User } = require('../../../models/api/v1/User');
const { sendApplicationMail } = require('./mailController');

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

        // check if user has already applied for job
        const applicationExists = await JobApplication.findOne({ job: jobId, user: userId });
        if (applicationExists) {
            return res.status(400).json({ message: 'You have already applied for this job' });
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
        user.applications.push(application);
        await user.save();

        const populatedJob = await Job.findById(jobId).populate('applications');

        await sendApplicationMail(job, user);

        res.status(201).json({ message: 'Job application submitted successfully' , job: populatedJob});
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

        await JobApplication.findByIdAndDelete(applicationId);

        const user = await User.findById(userId);
        user.applications.pull(applicationId);
        await user.save();

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