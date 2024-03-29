const Job = require('../../../../models/api/v1/Jobs');
const Business = require('../../../../models/api/v1/Business');
const { CustomError } = require('../../../../middlewares/errorHandler');

// get all business jobs
const getAllBusinessJobs = async (req, res, next) => {
    try {
        const businessId = req.params.id;
        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const linkedJobs = await Job.find({ _id: { $in: business.businessJobs.linkedJobs } });
        const offeredJobs = await Job.find({ _id: { $in: business.businessJobs.offeredJobs } });

        res.status(200).json({ linkedJobs, offeredJobs });
    } catch (error) {
        next(error);
    }
};

// create job
const createJob = async (req, res, next) => {
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
            'businessId',
            'url'
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
            throw new CustomError('Business ID is required.', 400);
        }

        // check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            throw new CustomError('Business not found.', 404);
        }

        // add business to job data
        jobData.business = businessId;

        // create new job
        const newJob = new Job(jobData);

        // generate unique URL for job
        const jobId = newJob._id.toString();
        const jobUrl = `http://kroo.site/jobs/${jobId}`; // CHANGE TO HTTPS EVENTUALLY
        newJob.url = jobUrl;

        // save new job to database
        await newJob.save();

        // add job to business
        business.businessJobs.linkedJobs.push(newJob._id);
        await business.save();

        res.status(201).json({
            success: true,
            message: 'Job created successfully.',
            data: {
                job: newJob
            }
        });
    } catch (error) {
        next(error);
    }
};

// update job
const updateJob = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        const updateData = req.body;

        // find job by ID and update it
        const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedJob) {
            throw new CustomError('Job not found.', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Job updated successfully.',
            data: {
                job: updatedJob,
            },
        });
    } catch (error) {
        next(error);
    }
};

// delete job
const deleteJob = async (req, res, next) => {
    try {
        const jobId = req.params.id;

        // Find the job by ID and delete it
        const deletedJob = await Job.findByIdAndDelete(jobId);

        if (!deletedJob) {
            throw new CustomError('Job not found.', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully.',
            data: {
                job: deletedJob,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBusinessJobs,
    createJob,
    updateJob,
    deleteJob
};
