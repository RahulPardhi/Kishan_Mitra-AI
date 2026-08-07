const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Name can only contain alphabetic characters and spaces"],
      minlength: [2, "Name must be at least 2 characters long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    mobile: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return !v || /^\d{10}$/.test(v);
        },
        message: "Mobile number must be exactly 10 numeric digits",
      },
    },

    location: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },

    avatar: {
      type: String,
      default: "",
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },

    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);