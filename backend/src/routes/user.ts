import { Request, Response, Router } from "express";
import Paper from "../models/Paper";
import User from "../models/User";
import { on } from "events";
import { Types } from "mongoose";

const router = Router();

router.get("/profile", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id)
      .populate('following', 'username email role')
      .populate('followers', 'username email role');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username, email, role, interests, following, followers } = user;
    return res.json({
      username,
      email,
      role,
      interests,
      following,
      followers,
      followingCount: following.length,
      followersCount: followers.length
    });
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

    const mentorsWithFollowStatus = mentors.map(mentor => ({
      ...mentor.toObject(),
      isFollowing: user.following.some(id => id.toString() === (mentor._id as Types.ObjectId).toString())
    }));

    return res.json({ mentors: mentorsWithFollowStatus });
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

router.get("/mentor/:mentorId", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const mentor = await User.findById(req.params.mentorId)
      .populate('following', 'username email role')
      .populate('followers', 'username email role');

    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    if (mentor.role !== "Mentor") {
      return res.status(400).json({ error: "User is not a mentor" });
    }

    const { _id, username, email, role, interests, following, followers } = mentor;
    const isFollowing = user.following.some(id => id.equals(mentor._id as Types.ObjectId));

    return res.json({
      _id,
      username,
      email,
      role,
      interests,
      following,
      followers,
      isFollowing,
      followingCount: following.length,
      followersCount: followers.length
    });
  } catch (error) {
    console.error("Error fetching mentor:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/follow/:userId", async (req: any, res: any) => {
  try {
    const currentUser = await User.findById(req.session.user._id).exec();
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userToFollow = await User.findById(req.params.userId).exec();
    if (!userToFollow) {
      return res.status(404).json({ error: "User to follow not found" });
    }

    if ((currentUser._id as Types.ObjectId).toString() === (userToFollow._id as Types.ObjectId).toString()) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    if (currentUser.following.some(id => id.toString() === (userToFollow._id as Types.ObjectId).toString())) {
      return res.status(400).json({ error: "Already following this user" });
    }

    currentUser.following.push(userToFollow._id as Types.ObjectId);
    userToFollow.followers.push(currentUser._id as Types.ObjectId);

    await currentUser.save();
    await userToFollow.save();

    return res.json({
      message: `Successfully followed ${userToFollow.username}`,
      isFollowing: true
    });
  } catch (error) {
    console.error("Error following user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/follow/:userId", async (req: any, res: any) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userToUnfollow = await User.findById(req.params.userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: "User to unfollow not found" });
    }

    if (!currentUser.following.some(id => id.toString() === (userToUnfollow._id as Types.ObjectId).toString())) {
      return res.status(400).json({ error: "Not following this user" });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== (userToUnfollow._id as Types.ObjectId).toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== (currentUser._id as Types.ObjectId).toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    return res.json({
      message: `Successfully unfollowed ${userToUnfollow.username}`,
      isFollowing: false
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/following", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id)
      .populate('following', 'username email role interests');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ following: user.following });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/followers", async (req: any, res: any) => {
  try {
    const user = await User.findById(req.session.user._id)
      .populate('followers', 'username email role interests');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ followers: user.followers });
  } catch (error) {
    console.error("Error fetching followers list:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
