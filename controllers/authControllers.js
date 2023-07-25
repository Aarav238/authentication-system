import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../modals/User.js';

export const register = async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      const token = jwt.sign({ userId: user._id }, 'yourSecretKey');
      res.json({
        message: "user logged in successfully",
        user,
        jsonwebtoken:  token });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  export const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
  };