import express from "express";
import { createPoolCampusDrive,getAllPoolCampusDrives } from "../controllers/poolCampusController.js";
// import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.post('/campusdrive', createPoolCampusDrive);
router.get('/drives', getAllPoolCampusDrives);


export default router;
