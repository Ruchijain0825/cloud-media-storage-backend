import express from "express";
import { signup,logout,login } from "../controller/auth.controller";
import { sign } from "jsonwebtoken";
const router = express.router();
router.post("/signup",signup);
router.post("/login",login);
router.post("logout",logout);
export default router;