import express from "express";
import authentication from "./users/authentication";

const router = express.Router();

router.use("/user", authentication);

export default router;
