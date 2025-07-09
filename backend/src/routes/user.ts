import { Request, Response, Router } from "express";
import Paper from "../models/Paper";
import User from "../models/User";
import { on } from "events";

const router = Router();

router.get("/profile", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username, email, role, interests } = user;
    return res.json({ username, email, role, interests });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username, email, role, interests } = req.body;
    user.username = username ? username.trim() : user.username;
    user.email = email ? email.trim() : user.email;
    user.role = role ? role : user.role;
    user.interests = interests ? interests : user.interests;
    await user.save();
    return res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/onboarding", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { role, interests } = req.body;
    if (!role || !interests || interests.length == 0) {
      return res
        .status(400)
        .json({ error: "Role and at least one interest is required" });
    }
    user.role = role;
    user.interests = interests;
    user.onboardingComplete = true;
    await user.save();
    req.session.user = user;
    return res.json({
      message: "Onboarding completed successfully",
      onboardingComplete: true,
      role: user.role,
      interests: user.interests,
    });
  } catch (error) {
    console.error("Error during onboarding:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mentors", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const mentors = await User.find({ role: "Mentor" });
    if (!mentors || mentors.length === 0) {
      return res.status(404).json({ error: "No mentors found" });
    }
    return res.json({ mentors });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const students = await User.find({ role: "Student" });
    if (!students || students.length === 0) {
      return res.status(404).json({ error: "No students found" });
    }
    return res.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
