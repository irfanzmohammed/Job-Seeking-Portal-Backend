import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title."],
    minLength: [3, "Title must contain at least 3 characters!"],
    maxLength: [30, "Title cannot exceed 30 characters!"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description."],
    minLength: [30, "Description must contain at least 30 characters!"],
    maxLength: [500, "Description cannot exceed 500 characters!"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category."],
  },
  country: {
    type: String,
    required: [true, "Please provide a country name."],
  },
  city: {
    type: String,
    required: [true, "Please provide a city name."],
  },
  location: {
    type: String,
    required: [true, "Please provide a location."],
    minLength: [20, "Location must contain at least 20 characters!"],
  },
  expired: {
    type: Boolean,
    default: false,
  },
  jobPostedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  interviewDate: {
    type: Date,
    required: [true, "Please provide an interview date."],
  },
  interviewTime: {
    type: String,
    required: [true, "Please provide an interview time."],
  },
  requiredSkills: {
    type: [String], // Array of strings for required skills
    default: [], // Default to an empty array
    validate: {
      validator: function (skills) {
        // Custom validator to ensure all skills are non-empty strings
        return skills.every((skill) => typeof skill === "string" && skill.trim() !== "");
      },
      message: "Required skills must be non-empty strings.",
    },
  },
});

export const Job = mongoose.model("Job", jobSchema);
