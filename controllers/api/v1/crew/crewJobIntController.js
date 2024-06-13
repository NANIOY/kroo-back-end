const Job = require('../../../../models/api/v1/Jobs');
const JobApplication = require('../../../../models/api/v1/JobApplication');
const { User } = require('../../../../models/api/v1/User');
const { sendApplicationMail } = require('../shared/mailController');
const Business = require('../../../../models/api/v1/Business');
const { CustomError } = require('../../../../middlewares/errorHandler');
const jwt = require('jsonwebtoken');

// get all applications
const getApplications = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).populate('userJobs.applications');
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const applications = user.userJobs.applications;
        const populatedApplications = await Promise.all(applications.map(async (application) => {
            const job = await Job.findById(application.job);
            return {
                application,
                job
            };
        }));

        res.status(200).json({ applications: populatedApplications });
    } catch (error) {
        next(error);
    }
};

// get job application by ID
const getJobApplicationById = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId).populate('userJobs.applications');
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const application = user.userJobs.applications.find(app => app._id.toString() === applicationId);
        if (!application) {
            throw new CustomError('Job application not found', 404);
        }

        res.status(200).json({ application });
    } catch (error) {
        next(error);
    }
};

// apply for job
const applyJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        if (!jobId) {
            throw new CustomError('Job ID is required', 400);
        }

        const job = await Job.findById(jobId);
        if (!job) {
            throw new CustomError('Job not found', 404);
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new CustomError('Authorization header is missing', 401);
        }

        const token = authHeader.split(' ')[1];

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (userId !== decodedToken.userId) {
            throw new CustomError('Unauthorized access', 401);
        }

        const applicationExists = await JobApplication.findOne({ job: jobId, user: userId });
        if (applicationExists) {
            throw new CustomError('You have already applied for this job', 400);
        }

        const business = await Business.findById(job.businessId);
        if (!business) {
            throw new CustomError('Business not found', 404);
        }

        const application = new JobApplication({
            job: jobId,
            user: userId,
            date: new Date(),
            status: 'pending'
        });

        await application.save();
        job.applications.push(application);
        await job.save();

        const user = await User.findById(userId);
        user.userJobs.applications.push(application);
        user.userJobs.saved_jobs.pull(jobId);
        await user.save();

        await sendApplicationMail(job, user, business);

        const populatedJob = await Job.findById(jobId).populate('applications');

        res.status(201).json({ message: 'Job application submitted successfully', job: populatedJob });
    } catch (error) {
        next(error);
    }
};

// delete job application
const deleteJobApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        if (!applicationId) {
            throw new CustomError('Application ID is required', 400);
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            throw new CustomError('Job application not found', 404);
        }

        if (application.user.toString() !== userId) {
            throw new CustomError('You are not authorized to delete this application', 403);
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
        next(error);
    }
};

// get all saved jobs
const getSavedJobs = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).populate('userJobs.saved_jobs');
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const savedJobs = user.userJobs.saved_jobs;
        res.status(200).json({ savedJobs });
    } catch (error) {
        next(error);
    }
};

// get saved job by ID
const getSavedJobById = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId).populate('userJobs.saved_jobs');
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const savedJob = user.userJobs.saved_jobs.find(job => job._id.toString() === jobId);
        if (!savedJob) {
            throw new CustomError('Saved job not found', 404);
        }

        res.status(200).json({ savedJob });
    } catch (error) {
        next(error);
    }
};

// save job to user
const saveJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        if (!jobId) {
            throw new CustomError('Job ID is required', 400);
        }

        const job = await Job.findById(jobId);
        if (!job) {
            throw new CustomError('Job not found', 404);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const isJobAlreadySaved = user.userJobs.saved_jobs.includes(jobId);
        if (isJobAlreadySaved) {
            throw new CustomError('Job is already saved', 400);
        }

        user.userJobs.saved_jobs.push(jobId);
        await user.save();

        res.status(200).json({ message: 'Job saved successfully', savedJobId: jobId });
    } catch (error) {
        next(error);
    }
};

// delete saved job from user
const deleteSavedJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        if (!jobId) {
            throw new CustomError('Job ID is required', 400);
        }

        const job = await Job.findById(jobId);
        if (!job) {
            throw new CustomError('Job not found', 404);
        }

        const user = await User.findById(userId);
        user.userJobs.saved_jobs.pull(jobId);
        await user.save();

        res.status(200).json({ message: 'Job deleted from saved jobs' });
    } catch (error) {
        next(error);
    }
};

// get offered jobs
const getOfferedJobs = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).populate('userJobs.offered_jobs');
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const offeredJobs = user.userJobs.offered_jobs;
        res.status(200).json({ offeredJobs });
    } catch (error) {
        next(error);
    }
};

// get offered job by ID
const getOfferedJobById = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId).populate('userJobs.offered_jobs');
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const offeredJob = user.userJobs.offered_jobs.find(job => job._id.toString() === jobId);
        if (!offeredJob) {
            throw new CustomError('Offered job not found', 404);
        }

        res.status(200).json({ offeredJob });
    } catch (error) {
        next(error);
    }
    // accept job offer
    const acceptOffer = async (req, res, next) => {
        try {

            res.status(200).json({ message: 'Job offer accepted successfully' });
        } catch (error) {
            next(error);
        }
    };

    // decline job offer
    const declineOffer = async (req, res, next) => {
        try {

            res.status(200).json({ message: 'Job offer declined successfully' });
        } catch (error) {
            next(error);
        }
    };

};

module.exports = {
    getApplications,
    getJobApplicationById,
    applyJob,
    deleteJobApplication,
    getSavedJobs,
    getSavedJobById,
    saveJob,
    deleteSavedJob,
    getOfferedJobs,
    getOfferedJobById,
    acceptOffer,
    declineOffer,
};