import { Router } from "express";
import { hashPassword, verifyPassword } from "./argon";
import User from "../models/User";

const router = Router();

router.post("/register", async (req: any, res: any) => {
  const { username, email, password: plainPassword } = req.body;
  if (!username || !email || !plainPassword) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required." });
  }
  try {
    if (await User.findOne({ username })) {
      return res.status(400).json({ error: "Username already exists." });
    } else if (await User.findOne({ email })) {
      return res.status(400).json({ error: "Email already exists." });
    } else {
      const encryptedPassword = await hashPassword(plainPassword);
      const newUser = new User({ username, email, encryptedPassword });
      await newUser.save();
      req.session.user = newUser._id;
      return res.status(201).json({ message: "User registered successfully." });
    }
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/login", async (req: any, res: any) => {
  const { email, password: plainPassword } = req.body;
  if (!email || !plainPassword) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      !(await verifyPassword(plainPassword, user.encryptedPassword))
    ) {
      return res.status(400).json({ error: "Invalid email or password." });
    } else {
      req.session.user = user;
      return res.json({ message: "Login successful." });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/logout", (req: any, res: any) => {
  try {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Logout failed." });
      } else {
        res.clearCookie("sessionId");
        return res.json({ message: "Logout successful." });
      }
    });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/status", (req: any, res: any) => {
  try {
    if (req.session && req.session.user) {
      return res.json({ authenticated: true, user: req.session.user });
    } else {
      return res.json({ authenticated: false });
    }
  } catch (err) {
    console.error("Error during status check:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
