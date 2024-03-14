const Job = require('../../../models/api/v1/Jobs');
const Business = require('../../../models/api/v1/Business');

// get all jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate({
            path: 'applications',
            select: '-job -__v' // exclude 'job' and '__v'
        });

        res.status(200).json({
            success: true,
            message: 'Jobs retrieved successfully.',
            data: {
                jobs
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve jobs.',
            error: error.message
        });
    }
};

// get job by id
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Job retrieved successfully.',
            data: {
                job
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve job.',
            error: error.message
        });
    }
};

// create job
const createJob = async (req, res) => {
    console.log('Request body:', req.body);

    try {
        const propertiesToExtract = [
            'title',
            'description',
            'wage',
            'date',
            'time',
            'skills',
            'jobFunction',
            'location',
            'production_type',
            'union_status',
            'attachments',
            'businessId'
        ];

        // extract properties from request body
        const jobData = {};
        propertiesToExtract.forEach(property => {
            if (req.body[property]) {
                jobData[property] = req.body[property];
            }
        });

        
        // check if businessId is provided
        const { businessId } = req.body;
        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business ID is required.'
            });
        }

        // check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found.'
            });
        }

        // add business to job data
        jobData.business = businessId;

        // create new job
        const newJob = new Job(jobData);

        // save new job to database
        await newJob.save();

        res.status(201).json({
            success: true,
            message: 'Job created successfully.',
            data: {
                job: newJob
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create job.',
            error: error.message
        });
    }
};

// update job
const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const updateData = req.body;

        // find job by ID and update it
        const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job updated successfully.',
            data: {
                job: updatedJob,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update job.',
            error: error.message,
        });
    }
};

// delete job
const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;

        // Find the job by ID and delete it
        const deletedJob = await Job.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully.',
            data: {
                job: deletedJob,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete job.',
            error: error.message,
        });
    }
};

module.exports = {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
};