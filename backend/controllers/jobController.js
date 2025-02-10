import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import ErrorHandler from "../middlewares/error.js";

// Get all jobs
export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
});

// Post a new job
export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to post jobs.", 403)
    );
  }

  const {
    title,
    description,
    category,
    country,
    city,
    location,
    interviewDate,
    interviewTime,
    requiredSkills, // Include requiredSkills in request body
  } = req.body;

  if (
    !title ||
    !description ||
    !category ||
    !country ||
    !city ||
    !location ||
    !interviewDate ||
    !interviewTime
  ) {
    return next(
      new ErrorHandler("Please provide all required job details.", 400)
    );
  }

  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    interviewDate,
    interviewTime,
    requiredSkills, // Save requiredSkills with the job
    postedBy,
  });

  res.status(201).json({
    success: true,
    message: "Job posted successfully.",
    job,
  });
});

// Get jobs posted by the logged-in user
export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 403)
    );
  }
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

// Update an existing job
export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    country,
    city,
    location,
    interviewDate,
    interviewTime,
    requiredSkills, // Include requiredSkills in request body
  } = req.body;

  const job = await Job.findByIdAndUpdate(
    id,
    {
      title,
      description,
      category,
      country,
      city,
      location,
      interviewDate,
      interviewTime,
      requiredSkills, // Update requiredSkills with the job
    },
    { new: true, runValidators: true }
  );

  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Job updated successfully.",
    job,
  });
});

// Delete a job
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 403)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job deleted successfully.",
  });
});

// Get a single job by ID
export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return next(new ErrorHandler("Invalid job ID.", 400));
  }
});
