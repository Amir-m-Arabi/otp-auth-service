import express from "express";
import {
  sendOTP,
  signIn,
  signInOrSignUpWithOTP,
  Phone,
  OTP,
} from "../../controller/users/authentication";
import { authenticateToken } from "../../middleware/tokenValidationMiddleware";

const router = express.Router();

router.post("/otp-request", Phone, sendOTP);
router.post("/otp-check", Phone, OTP, signInOrSignUpWithOTP);
router.get("/signIn", authenticateToken, signIn);

export default router;
