import { register, login , logout, forgotPassword, getUserProfile, updateUserProfile, authenticateToken } from "../controllers/authControllers.js";
import express from "express"


const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("logout",logout);
router.post('/forgot-password', forgotPassword);
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

export default router;

