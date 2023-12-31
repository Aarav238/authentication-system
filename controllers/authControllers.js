import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modals/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendResetTokenMail = async (email, token) => {
  const mailOptions = {
    from: "aaravshukla8896@gmail.com",
    to: email,
    subject: "Password Reset Token",
    body: `Your Password Reset token : ${token}`,
  };

  try {
    console.log(typeof process.env.EMAIL, typeof process.env.PASS)
    const info = await transporter.sendMail(mailOptions);
    console.log("email sent:", info.response);
    return info;
  } catch (error) {
    console.error("error occurred in sending email", error);
    res.status(500).json({ error: "cant send" });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign({ userId: user._id }, "yourSecretKey");
    res.json({
      message: "user logged in successfully",
      user,
      jsonwebtoken: token,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    await sendResetTokenMail(email, resetToken);
    res.json({
      message: "password reset token sent successfully to your email",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
export const getUserProfile = async (req, res) => {
  try {
    // Retrieve the user ID from the JWT payload
    const userId = req.user.userId;
    
    // Fetch the user from the database based on the user ID
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    // Retrieve the user ID from the JWT payload
    const userId = req.user.userId;

    // Fetch the user from the database based on the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's profile information
    user.name = req.body.name || user.name;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    user.bio = req.body.bio || user.bio;

    await user.save();

    res.json({ message: 'User profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};


export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token not provided' });
  }

  jwt.verify(token, 'yourSecretKey', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};


export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};