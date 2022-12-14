const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Op} = require('sequelize');
const createError = require("../utils/createError");
const {User} = require('../models');

const genToken = payload => jwt.sign(payload, process.env.JWT_SECRET_KEY,{
    expiresIn: process.env.JWT_EXPIRES_IN
});

exports.login = async (req,res,next) => {
    try {
        const {emailOrPhone,password} = req.body;
        const user = await User.findOne({ where: {
            [Op.or]: [
                {email: emailOrPhone}, {phoneNumber: emailOrPhone}]
        }
        });
        if(!user){
            createError('invalid credential', 400);
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            createError('invalid credential', 400);
        }

      const token = genToken({ id: user.id})
      res.json({ token });
    } catch(err){
        next(err);
    }
};

exports.signup = async (req,res,next) => {
    try {
    const {firstName,lastName,emailOrPhone,password,confirmPassword} =
        req.body;
        if(!emailOrPhone) {
            createError('email or phone number is required', 400)
        }
        if(!password){
            createError('password is required', 400)
        }
        if(password !== confirmPassword){
            createError('password and confirm password is not match', 400)
        }

        const isMobilePhone = validator.isMobilePhone(emailOrPhone+'');
        const isEmail = validator.isEmail(emailOrPhone+'');

        if(!isMobilePhone && !isEmail){
            createError('email or phone number is invalid format', 400);
        }
        const hashedPassword = await bcrypt.hash(password,12);
        const user = await User.create({
            firstName,
            lastName,
            email: isEmail ? emailOrPhone:null,
            phoneNumber: isMobilePhone ? emailOrPhone:null,
            password: hashedPassword
        });


        const token = genToken({ id: user.id});
        res.status(201).json({ token});
    } catch(err){
        next(err);
    }
};