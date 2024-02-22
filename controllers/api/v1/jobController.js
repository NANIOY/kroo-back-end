const Job = require('../../../models/api/v1/Jobs');

// get all jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find();

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


// create job
const createJob = async (req, res) => {
    console.log('Request body:', req.body);

    try {
        const {
            title,
            company,
            description,
            wage,
            date,
            time,
            skills,
            func,
            location,
            production_type,
            union_status,
            attachments,
            cluster_name
        } = req.body;

        // create new job
        const newJob = new Job({
            title,
            company,
            description,
            wage,
            date,
            time,
            skills,
            function: func,
            location,
            production_type,
            union_status,
            attachments,
            cluster_name
        });

        // save new job to database
        await newJob.save();

        res.status(201).json({
            success: true,
            message: 'Job created successfully.',
            data: {
                
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

module.exports = {
    getJobs,
    createJob
};