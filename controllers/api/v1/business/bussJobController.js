const Job = require('../../../../models/api/v1/Jobs');
const Business = require('../../../../models/api/v1/Business');
const { CustomError } = require('../../../../middlewares/errorHandler');
const axios = require('axios');

// get all business jobs
const getAllBusinessJobs = async (req, res, next) => {
    try {
        const businessId = req.params.id;
        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const linkedJobs = await Job.find({ _id: { $in: business.businessJobs.linkedJobs }, status: 'open' });
        const offeredJobs = await Job.find({ _id: { $in: business.businessJobs.offeredJobs }, status: 'open' });

        res.status(200).json({ linkedJobs, offeredJobs });
    } catch (error) {
        next(error);
    }
};

// create job
const createJob = async (req, res, next) => {
    console.log('Request body:', req.body);

    try {
        const {
            title,
            description,
            wage,
            date,
            time,
            skills,
            jobFunction,
            location,
            production_type,
            union_status,
            attachments,
            businessId
        } = req.body;

        if (!businessId) {
            throw new Error('Business ID is required.', 400);
        }

        const business = await Business.findById(businessId);
        if (!business) {
            throw new Error('Business not found.', 404);
        }

        // determine country based on city if not provided
        if (!location.country && location.city) {
            const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(location.city)}&addressdetails=1`;
            const response = await axios.get(apiUrl, {
                headers: { 'Accept-Language': 'en' }
            });
            if (response.data && response.data.length > 0) {
                location.country = response.data[0].address.country;
            } else {
                throw new Error('Unable to fetch country for the provided city.');
            }
        }

        const newJob = new Job({
            title,
            businessId,
            description,
            wage,
            date,
            time,
            skills,
            jobFunction,
            location: {
                city: location.city,
                country: location.country,
                address: location.address
            },
            production_type,
            union_status,
            attachments
        });

        const jobId = newJob._id.toString();
        newJob.url = `http://kroo.site/jobs/${jobId}`;
        await newJob.save();

        business.businessJobs.linkedJobs.push(newJob._id);
        await business.save();

        res.status(201).json({
            success: true,
            message: 'Job created successfully.',
            data: { job: newJob }
        });
    } catch (error) {
        console.log('Error creating job:', error.message);
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
