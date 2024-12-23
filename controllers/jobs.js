const {StatusCodes} = require('http-status-codes')
const JobSchema = require('../models/Job')
const BadRequestError = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found');

const getAllJobs = async (req, res) => {
    let jobs = await JobSchema
        .find({createdBy: req.user.userId})
        .sort('createdAt')
    res.status(StatusCodes.OK).json({jobs, nbHits: jobs.length})
}
const getJob = async (req, res) => {
    const {id: jobId} = req.params;
    const {userId} = req.user;
    const job = await JobSchema.findOne({_id: jobId, createdBy: userId})
    if(!job) throw new NotFoundError(`No job with id: ${jobId}`)
    res.status(StatusCodes.OK).json({job})
}
const deleteJob = async (req, res) => {
    const {id: jobId} = req.params;
    const {userId} = req.user;
    const job = await JobSchema.findOneAndRemove({
        _id: jobId,
        createdBy: userId
    })
    if(!job) throw new NotFoundError(`No job with id: ${jobId}`)
    res.status(StatusCodes.OK).json({job})
}
const updateJob = async (req, res) => {
    const {id: jobId} = req.params;
    const {userId} = req.user;
    const {position, company} = req.body;

    if(!position || !company) {
        throw BadRequestError('Provided a position and company');
    }

    const job = await JobSchema.findOneAndUpdate(
        {
            _id: jobId,
            createdBy: userId
        }, 
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );
    if(!job) {
        throw new NotFoundError(`No job with id: ${jobId}`)
    }
    res.status(StatusCodes.OK).json({job})
}
const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId;
    const job = await JobSchema.create(req.body)
    res.status(StatusCodes.CREATED).json({job})
}

module.exports = {
    getAllJobs,
    getJob,
    deleteJob,
    updateJob,
    createJob,
}