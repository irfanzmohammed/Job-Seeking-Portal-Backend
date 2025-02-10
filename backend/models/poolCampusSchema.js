import mongoose from "mongoose";

const poolCampusSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, "Please provide the company name."],
  },
  jobRole: {
    type: String,
    required: [true, "Please provide the job role."],
  },
  companyLocation: {
    type: String,
    required: [true, "Please provide the company location."],
  },
  collegeName: {
    type: String,
    required: [true, "Please provide the college name."],
  },
  applicationLink: {
    type: String,
    required: [true, "Please provide the application link."],
    validate: {
      validator: function (value) {
        // Validate URL format using a regex
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: "Invalid URL format for application link.",
    },
  },
  collegeLocation: {
    type: String,
    required: [true, "Please provide the college location."],
  },
  dateOfDrive: {
    type: String,
    required: [true, "Please provide the date of the campus drive."],
    default: new Date().toISOString().slice(0, 10), // Set default value to today's date (ISO format)
  },
});

const PoolCampus = mongoose.model("PoolCampus", poolCampusSchema);

export default PoolCampus;
