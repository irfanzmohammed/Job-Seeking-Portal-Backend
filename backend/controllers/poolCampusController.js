import PoolCampus from "../models/poolCampusSchema.js";

import ErrorHandler from "../middlewares/error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";

// Create a new pool campus drive
export const createPoolCampusDrive = catchAsyncErrors(async (req, res, next) => {
console.log('Request Body:', req.body);
  const {
    companyName,
    jobRole,
    companyLocation,
    collegeName,
    applicationLink,
    collegeLocation,
  } = req.body;

  // Check if required fields are provided
  if (!companyName || !jobRole || !companyLocation || !collegeName || !applicationLink || !collegeLocation) {
    return next(new ErrorHandler("All fields are required", 400));
  }
  
  // Create a new pool campus drive
  const newPoolCampusDrive = await PoolCampus.create({
    companyName,
    jobRole,
    companyLocation,
    collegeName,
    applicationLink,
    collegeLocation,
  });

  res.status(201).json({ success: true, message: "Pool Campus Drive created successfully", data: newPoolCampusDrive });
});

// Implement other pool campus drive operations (e.g., get all drives, update drive, delete drive) here if needed
export const getAllPoolCampusDrives = catchAsyncErrors(async (req, res, next) => {
    const poolCampusDrives = await PoolCampus.find();
  
    if (!poolCampusDrives) {
      return next(new ErrorHandler('No pool campus drives found', 404));
    }
  
    res.status(200).json({
      success: true,
      poolCampusDrives,
    });
  });

  