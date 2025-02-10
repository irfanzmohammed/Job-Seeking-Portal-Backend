import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";


export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role, skills } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill in all required fields.", 400));
  }

  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    return next(new ErrorHandler("Email is already registered.", 400));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    skills: role === "Job Seeker" ? skills : [], 
  });

  sendToken(user, 201, res, "User registered successfully.");
});

// Login user
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password, and role.", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid credentials.", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials.", 401));
  }

  if (user.role !== role) {
    return next(new ErrorHandler(`User with provided email and role '${role}' not found.`, 404));
  }

  sendToken(user, 200, res, "User logged in successfully.");
});

// Logout user
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({ success: true, message: "User logged out successfully." });
});

// Get logged-in user details
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, user });
});


export const getUserSkills = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select('skills');
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({ success: true, skills: user.skills });
  } catch (error) {
    return next(new ErrorHandler("Failed to fetch user skills", 500));
  }
});


export const addUserSkill = catchAsyncErrors(async (req, res, next) => {
  const { skill } = req.body;
  const userId = req.user._id;

  if (!skill) {
    return next(new ErrorHandler("Skill is required.", 400));
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.skills.includes(skill)) {
      return next(new ErrorHandler("Skill already exists for the user.", 400));
    }

    user.skills.push(skill);
    await user.save();

    res.status(201).json({ success: true, message: "Skill added successfully.", user });
  } catch (error) {
    return next(new ErrorHandler("Failed to add skill.", 500));
  }
});
