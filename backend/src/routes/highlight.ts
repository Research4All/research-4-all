import { Request, Response, Router } from "express";
import Highlight from "../models/Highlight";
import Paper from "../models/Paper";

const router = Router();

router.post("/", async (req: any, res: any) => {
  try {
    const { text, range, color, paperMongoId } = req.body;

    if (!text || !range || !paperMongoId) {
      return res.status(400).json({
        error: "Text, range, and paperMongoId are required",
      });
    }

    if (!range.startContainer || typeof range.startOffset !== 'number' || 
        !range.endContainer || typeof range.endOffset !== 'number') {
      return res.status(400).json({
        error: "Range must include startContainer, startOffset, endContainer, and endOffset",
      });
    }

    const highlight = new Highlight({
      text,
      range,
      color: color || "yellow",
      paperMongoId, 
      userId: req.session.user._id,
    });

    await highlight.save();

    await Paper.findByIdAndUpdate(
      paperMongoId,
      { $push: { highlights: highlight._id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Highlight created successfully",
      highlight,
    });
  } catch (error) {
    console.error("Error creating highlight:", error);
    return res.status(500).json({ error: "Failed to create highlight" });
  }
});

router.get("/paper/:paperMongoId", async (req: any, res: any) => {
  try {
    const { paperMongoId } = req.params;
    const { userId } = req.query;

    let query: any = { paperMongoId };

    if (userId) {
      query.userId = userId;
    } else {
      query.userId = req.session.user._id;
    }

    const highlights = await Highlight.find(query)
      .populate("userId", "username email");

    return res.json({ highlights });
  } catch (error) {
    console.error("Error fetching highlights:", error);
    return res.status(500).json({ error: "Failed to fetch highlights" });
  }
});

router.delete("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const highlight = await Highlight.findOne({
      _id: id,
      userId: req.session.user._id,
    });

    if (!highlight) {
      return res.status(404).json({ error: "Highlight not found" });
    }

    await Paper.findByIdAndUpdate(highlight.paperMongoId, {
      $pull: { highlights: highlight._id },
    });

    await Highlight.findByIdAndDelete(id);

    return res.json({ message: "Highlight deleted successfully" });
  } catch (error) {
    console.error("Error deleting highlight:", error);
    return res.status(500).json({ error: "Failed to delete highlight" });
  }
});

export default router;