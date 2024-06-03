const Job = require('../../../../models/api/v1/Jobs');
const { User } = require('../../../../models/api/v1/User');
const { CustomError } = require('../../../../middlewares/errorHandler');

// get all jobs
const getAllJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({ status: 'open' });

        res.status(200).json({
            success: true,
            message: 'Jobs retrieved successfully.',
            data: {
                jobs
            }
        });
    } catch (error) {
        next(error);
    }
};

// get all assigned jobs for logged in user
const getCrewJobs = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).populate('userJobs');

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const userJobs = user.userJobs;
        res.status(200).json({ userJobs });
    } catch (error) {
        next(error);
    }
};

// get job by id
const getJobById = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            throw new CustomError('Job not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Job retrieved successfully.',
            data: {
                job
            }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllJobs,
    getCrewJobs,
    getJobById
};
