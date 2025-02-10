import express from "express";
import { login, register, logout, getUser, getUserSkills, addUserSkill } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Route for user registration
router.post("/register", register);

// Route for user login
router.post("/login", login);

// Route for user logout (requires authentication)
router.get("/logout", isAuthenticated, logout);

// Route for getting logged-in user details (requires authentication)
router.get("/getuser", isAuthenticated, getUser);

// Route for fetching job seeker skills (requires authentication)
router.get("/skills", isAuthenticated, getUserSkills);

// Route for adding a new skill to user's profile (requires authentication)
router.post("/skills/add", isAuthenticated, addUserSkill);

export default router;

