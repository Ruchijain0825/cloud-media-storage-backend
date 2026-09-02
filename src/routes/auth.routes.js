import express from "express";

import {
    signup,
    logout,
    login,
    googleCallback,
} from "../controller/auth.controller.js";

import passport from "../config/googleOAuth.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect:
            "http://localhost:3000/login?error=google_auth_failed",
    }),
    googleCallback
);

export default router;