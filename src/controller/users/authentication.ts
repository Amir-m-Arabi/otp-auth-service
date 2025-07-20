import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { redis } from "../../utils/redis";

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

export const Phone = [
  body("phoneNumber")
    .isString()
    .withMessage("PhoneNumber must be a string")
    .matches(/^09\d{9}$/)
    .withMessage("PhoneNumber must be a valid Iranian number"),
];
export const OTP = [
  body("otp")
    .isString()
    .withMessage("OTP must be a string")
    .matches(/^\d{6}$/)
    .withMessage("OTP must be exactly 6 digits"),
];
export async function signInOrSignUpWithOTP(
  req: express.Request,
  res: express.Response
): Promise<any> {
  const error = validationResult(req);
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

    const otpEntry = await prisma.otpRequest.findFirst({
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

    await prisma.otpRequest.update({
      where: { id: otpEntry.id },
      data: { used: true },
    });

    let user = await prisma.user.findFirst({
      where: { mobile: phoneNumber },
    });

    let message = "";
    if (!user) {
      user = await prisma.user.create({
        data: { mobile: phoneNumber },
      });
      message = "Signup successful. Welcome!";
    } else {
      message = "Welcome back!";
    }

    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile },
      JWT_SECRET!,
      { expiresIn: "15m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });

    return res.status(200).json({
      message,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

export async function sendOTP(
  req: express.Request,
  res: express.Response
): Promise<any> {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const redisKey = `otp_limit:${phoneNumber}`;
    const otpRequestLimit = 5;
    const timeWindow = 3600;

    const requestCount = await redis.get(redisKey);

    if (requestCount && parseInt(requestCount) >= otpRequestLimit) {
      return res.status(429).json({
        message: `OTP limit reached. Please try again after ${timeWindow} seconds.`,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.otpRequest.create({
      data: {
        mobile: phoneNumber,
        code: otp,
      },
    });

    await redis
      .multi()
      .set(redisKey, "1", "EX", timeWindow)
      .incr(redisKey)
      .exec();

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("OTP Error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

export async function signIn(
  req: express.Request,
  res: express.Response
): Promise<any> {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  try {
    const id = req.cookies.userData.userId;

    const mobile = req.cookies.userData.mobile;

    if (!id || !mobile) {
      return res.status(400).json({ message: "id and mobile are required." });
    }

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}
