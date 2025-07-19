"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = exports.Phone = void 0;
exports.signInOrSignUpWithOTP = signInOrSignUpWithOTP;
exports.sendOTP = sendOTP;
exports.signIn = signIn;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const redis_1 = require("../../utils/redis");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
exports.Phone = [
    (0, express_validator_1.body)("phoneNumber")
        .isString()
        .withMessage("PhoneNumber must be a string")
        .matches(/^09\d{9}$/)
        .withMessage("PhoneNumber must be a valid Iranian number"),
];
exports.OTP = [
    (0, express_validator_1.body)("otp")
        .isString()
        .withMessage("OTP must be a string")
        .matches(/^\d{6}$/)
        .withMessage("OTP must be exactly 6 digits"),
];
function signInOrSignUpWithOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        try {
            const { phoneNumber, otp } = req.body;
            if (!phoneNumber || !otp) {
                return res
                    .status(400)
                    .json({ message: "Phone number and OTP are required." });
            }
            const otpEntry = yield prisma.otpRequest.findFirst({
                where: {
                    mobile: phoneNumber,
                    used: false,
                    createdAt: {
                        gte: new Date(Date.now() - 5 * 60 * 1000),
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            if (!otpEntry || otpEntry.code !== otp) {
                return res.status(400).json({ message: "Invalid or expired OTP." });
            }
            yield prisma.otpRequest.update({
                where: { id: otpEntry.id },
                data: { used: true },
            });
            let user = yield prisma.user.findFirst({
                where: { mobile: phoneNumber },
            });
            let message = "";
            if (!user) {
                user = yield prisma.user.create({
                    data: { mobile: phoneNumber },
                });
                message = "Signup successful. Welcome!";
            }
            else {
                message = "Welcome back!";
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id, mobile: user.mobile }, JWT_SECRET, { expiresIn: "15m" });
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 30 * 60 * 1000,
            });
            return res.status(200).json({
                message,
            });
        }
        catch (error) {
            console.error("OTP Verification Error:", error);
            return res.status(500).json({ message: "Something went wrong." });
        }
    });
}
function sendOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ errors: error.array() });
        }
        try {
            const { phoneNumber } = req.body;
            if (!phoneNumber) {
                return res.status(400).json({ message: "Phone number is required." });
            }
            const redisKey = `otp_limit:${phoneNumber}`;
            const isBlocked = yield redis_1.redis.get(redisKey);
            if (isBlocked) {
                return res.status(429).json({
                    message: "OTP already sent. Please wait a minute before requesting again.",
                });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            yield prisma.otpRequest.create({
                data: {
                    mobile: phoneNumber,
                    code: otp,
                },
            });
            yield redis_1.redis.set(redisKey, "1", "EX", 60); // 60 ثانیه محدودیت
            console.log(`OTP for ${phoneNumber}: ${otp}`);
            return res.status(200).json({ message: "OTP sent successfully." });
        }
        catch (error) {
            console.error("OTP Error:", error);
            return res.status(500).json({ message: "Something went wrong." });
        }
    });
}
function signIn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        try {
            const id = req.cookies.userData.id;
            const mobile = req.cookies.userData.mobile;
            if (!id || !mobile) {
                return res.status(400).json({ message: "id and mobile are required." });
            }
            const user = yield prisma.user.findUnique({
                where: {
                    id: Number(id),
                },
                select: {
                    mobile: true,
                },
            });
            if (!user || user.mobile !== String(mobile)) {
                return res
                    .status(400)
                    .json({ message: "Invalid or missing authentication data." });
            }
            return res
                .status(200)
                .json({ message: "User authenticated successfully." });
        }
        catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ message: "Something went wrong." });
        }
    });
}
