import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt  from "jsonwebtoken";

const verifyJwt = asyncHandler(async(req,res,next)=>{
    try {
        console.log("Verifying tokens");
        // console.log(req.cookies);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            return next(new ApiError(401,"Something went wrong. Please try again later!!!"))
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            return next(new ApiError(403,"Invalid Access Token"));
        }
    
        req.user = user;
        console.log("Verified token");
        next();
    } catch (error) {
        return next(new ApiError(400,"Something went wrong"));
    }
})


export {verifyJwt}