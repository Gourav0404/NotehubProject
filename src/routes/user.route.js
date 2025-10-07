import { Router } from "express";
import {verifyJwt} from "../middleware/auth.middleware.js"
import {loginUser, signupUser, checkAuth,logoutUser,forgotPassword,checkOtp,resetPassword} from "../controllers/user.controller.js"

const router = Router();


router.route("/signup").post(signupUser)
router.route("/login").post(loginUser)
router.route("/check-auth").post(verifyJwt,checkAuth)
router.route("/logout").post(logoutUser)
router.route("/forgot-pass").post(forgotPassword)
router.route("/checkOtp").post(checkOtp)
router.route("/reset-password").post(resetPassword)


export {router};