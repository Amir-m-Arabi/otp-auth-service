"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../../controller/users/authentication");
const tokenValidationMiddleware_1 = require("../../middleware/tokenValidationMiddleware");
exports.default = (router) => {
    router.post("/otp-request", authentication_1.Phone, authentication_1.sendOTP);
    router.post("/otp-check", authentication_1.Phone, authentication_1.OTP, authentication_1.signInOrSignUpWithOTP);
    router.get("/signIn", tokenValidationMiddleware_1.authenticateToken, authentication_1.signIn);
};
