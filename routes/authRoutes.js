import { register, login , logout, forgotPassword } from "../controllers/authControllers.js";
import express from "express"


const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("logout",logout);
router.post('/forgot-password', forgotPassword);

export default router;

