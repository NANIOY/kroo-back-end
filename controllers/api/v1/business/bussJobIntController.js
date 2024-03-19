const Job = require('../../../../models/api/v1/Jobs');
const { User } = require('../../../../models/api/v1/User');
const Business = require('../../../../models/api/v1/Business');
const { CustomError } = require('../../../../middlewares/errorHandler');
const { sendJobOfferEmail } = require('../shared/mailController');

// offer job
const offerJob = async (req, res, next) => {
    try {
        const jobId = req.params.jobId;
        const { email } = req.body;
        const userId = req.user.userId;
        const loggedInUser = await User.findById(userId);
        const businessId = loggedInUser.businessData;
        const job = await Job.findById(jobId);
        const business = await Business.findById(businessId);
        const crewMember = await User.findOne({ email });

        if (!loggedInUser) {
            throw new CustomError('User not found', 404);
        }

        if (!job) {
            throw new CustomError('Job not found', 404);
        }

        if (!business) {
            throw new CustomError('Business not found', 404);
        }

        if (!crewMember) {
            console.error('Crew Member not found:', email);
            throw new CustomError('Crew member not found', 404);
        }
        
        if (crewMember.role !== 'crew') {
            console.error('User found, but not a crew member:', email);
            throw new CustomError('Invalid crew member email', 400);
        }

        job.offeredTo = crewMember._id;
        await job.save();

        crewMember.userJobs.offered_jobs.push(job._id);
        await crewMember.save();
        business.businessJobs.offeredJobs.push(job._id);
        await business.save();

        await sendJobOfferEmail(crewMember.email, crewMember, business);

        res.status(200).json({ message: 'Job offered successfully', data: { job } });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    offerJob
};