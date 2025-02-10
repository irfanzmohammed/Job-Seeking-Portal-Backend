// Import and configure dotenv at the start
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' }); 
// Other imports
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Configure the Gmail API credentials and transporter
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Async function to create transporter
const createTransporter = async () => {
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.OAUTH_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
};

// Function to send application email
const sendApplicationEmail = async (jobDetails, applicantEmail) => {
  const transporter = await createTransporter(); // Await the transporter creation here
  const emailTemplate = `
    <p>Dear Applicant,</p>
    <p>Your application for the job <strong>${jobDetails.title}</strong> has been received successfully.</p>
    <p>The interview is scheduled on ${new Date(jobDetails.interviewDate).toDateString()} at ${jobDetails.interviewTime} at ${jobDetails.location}.</p>
    <p>Thank you for applying!</p>
    <p>Best regards,<br/>Team JobZee</p>
  `;

  const mailOptions = {
    to: applicantEmail,
    subject: 'Job Application Received',
    html: emailTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Route handler for submitting an application
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(new ErrorHandler("Invalid file type. Please upload a PNG file.", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = { user: req.user._id, role: "Job Seeker" };

  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = { user: jobDetails.postedBy, role: "Employer" };

  if (!name || !email || !phone || !applicantID || !employerID || !resume) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  const application = await Application.create({
    name,
    email,
    phone,
    applicantID,
    employerID,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  // Send the application email
  await sendApplicationEmail(jobDetails, email);

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

// Other functions...
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }
  const { _id } = req.user;
  const applications = await Application.find({ "employerID.user": _id });
  res.status(200).json({
    success: true,
    applications,
  });
});

export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  const { _id } = req.user;
  const applications = await Application.find({ "applicantID.user": _id });
  res.status(200).json({
    success: true,
    applications,
  });
});

export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }
  await application.deleteOne();
  res.status(200).json({
    success: true,
    message: "Application Deleted!",
  });
});
