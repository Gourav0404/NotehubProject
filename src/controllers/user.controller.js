import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const generateAccessAndRefreshToken = async(userId)=>{
    const user = await User.findById(userId);
    const accessToken =  user.generateAccessToken();
    const refreshToken =   user.generateRefreshToken();
    // console.log(accessToken);
    // console.log(refreshToken);

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: true})

    return {accessToken,refreshToken};
}

const signupUser = asyncHandler(async(req,res,next)=>{
    console.log(req.body);

    const { username, email, password, name } = req.body;
    if(!username || !email || !password || !name ){
        return next(new ApiError(400,"All fields are required!!!"));
    }

    const userWithAlreadyUsedUsername = await User.findOne({username});
    if(userWithAlreadyUsedUsername){
        return next(new ApiError(402,"Username already used"));
    }

    const userWithAlreadyUsedEmail = await User.findOne({email});
    if(userWithAlreadyUsedEmail){
        return next(new ApiError(402,"Email is already in use"));
    }

    const user = await User.create({
        username,
        email,
        password,
        name
    })
    console.log(user);

    const createdUser = await User.findById(user._id);
    if(!createdUser){
        return next(new ApiError(500,"User can't be created"));
    }

    res.status(200).json(
        new ApiResponse(
            200,
            "Account Created Successfully !!!",
            createdUser
        )
    )
})

const loginUser = asyncHandler(async(req,res,next)=>{
    console.log(req.body);
    const { email, password } = req.body;

    if(!email || !password){
        return next(new ApiError(400,"Email or password is required"));
        // throw new ApiError(400,"Email or password is required");
    }

    const user = await User.findOne({email});
    if(!user){
        return next(new ApiError(401,"Invalid login credentials"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        return next(new ApiError(401,"Password is incorrect. Try again!!!"));
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");
    console.log(loggedInUser)

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            "User loggedin successfully!!!",
            loggedInUser
        )
    )
})

const checkAuth = asyncHandler(async(req,res,next)=>{
    const user = req.user;
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Token verified",
            user
        )
    )
})

const logoutUser = asyncHandler(async(req,res,next)=>{
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }
    res.clearCookie('accessToken',options);
    res.clearCookie('refreshToken',options);
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Logout successfully"
        )
    )
})

const forgotPassword = asyncHandler(async(req,res,next)=>{
    const {email} = req.body;
    console.log("email: ",email);

    if(!email){
        return next(new ApiError(400,"Email is required"));
    }

    const user = await User.findOne({email});

    if(!user){
        return next(new ApiError(401,'User do not exixts'));
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 5 * 60 * 1000);

    user.resetCode = resetCode;
    user.resetExpiration = expiration;
    await user.save();

    const transporter = nodemailer.createTransport({
        host:'smtp.sendgrid.net',
        port:587,
        auth:{
            user:"apikey",
            pass:process.env.SENDGRID_API_KEY
        }
    })

    try {
        await transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL, // must be verified sender
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}`,
        html: `<p>Hello,</p><p>Your password reset code is: <strong>${resetCode}</strong></p><p>This code will expire in 5 minutes.</p>`
        });

        res.status(200).json({ success: true, message: 'Reset code sent' });
    } catch (err) {
        console.error('Email send error:', err);
        return next(new ApiError(500, 'Failed to send reset email'));
    }

    // res
    // .status(200)
    // .json(
    //     new ApiResponse(
    //         200,
    //         "Email sent Successfully!!!"
    //     )
    // )
})

const checkOtp = asyncHandler(async(req,res,next)=>{
    const {email,code} = req.body;
    console.log("Email: ",email);
    console.log("code: ",code);

    if(!email || !code){
        return next(new ApiError(400,"Email or OTP is required"));
    }

    const user = await User.findOne({email});

    if(!user || !user.resetCode || !user.resetExpiration){
        return next(new ApiError(401,"Invalid or expired Reset Code"));
    }

    if(user.resetCode !== code){
        return next(new ApiError(401,"Incorrect Reset Code"));
    }

    if(new Date() > user.resetExpiration){
        return next(new ApiError(401,"Reset Code has been Expired"));
    }

    user.resetCode = undefined;
    user.resetExpiration = undefined;
    await user.save();

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Reset Code verified Successfully"
        )
    )
})

const resetPassword = asyncHandler(async(req,res,next)=>{
    const {email,password,cnfPassword} = req.body;
    console.log("Email: ",email);
    console.log("Password: ",password);
    console.log("Cnf-Password: ",cnfPassword);

    if(!email || !password || !cnfPassword){
        return next(new ApiError(400,"All Fields are Required"));
    }

    if(password !== cnfPassword){
        return next(new ApiError(400,"Password do not match with confirm Password"));
    }

    const user = await User.findOne({email});

    if(!user){
        return next(new ApiError(401,"Invalid Email"));
    }

    user.password = password;
    await user.save();

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Password Updated Successfully"
        )
    )

    
})

export {signupUser,loginUser,checkAuth,logoutUser,forgotPassword,checkOtp,resetPassword}