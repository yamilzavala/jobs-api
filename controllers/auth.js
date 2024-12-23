const {StatusCodes} = require('http-status-codes')
const User = require('../models/User');
const BadRequestError = require('../errors/bad-request');
const UnauthenticatedError = require('../errors/unauthenticated');

const login = async (req, res) => { 
  const {email, password} = req.body;
  if(!email || !password) {
    throw new BadRequestError('Please provided email and password!')
  }
  const user = await User.findOne({email});
  if(!user) {
    throw new UnauthenticatedError('Invalid credentials!')
  }
  //compare password
  const isPasswordCorrect = await user.comparePasswords(password);
  if(!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials!')
  }
  const token = user.createJWT(); 
  res.status(StatusCodes.OK).json({user:{name: user.name}, token})
}

const register = async (req, res) => {  
  const user = await User.create({...req.body})
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name
    }, 
    token
  })
}

module.exports = {
  login, 
  register
}