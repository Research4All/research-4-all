import { Request, Response, Router } from "express";
import Annotation from "../models/Annotation";
import Paper from "../models/Paper";

const router = Router();

router.post("/", async (req: any, res: any) => {
  try {
    const { text, comment, range, position, paperMongoId } = req.body;

    if (!text || !comment || !range || !position || !paperMongoId) {
      return res.status(400).json({
        error: "Text, comment, range, position, and paperMongoId are required",
      });
    }

    const annotation = new Annotation({
      text,
      comment,
      range,
      position,
      paperMongoId,
      userId: req.session.user._id,
    });

    await annotation.save();

    await Paper.findByIdAndUpdate(
      paperMongoId,
      { $push: { annotations: annotation._id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Annotation created successfully",
      annotation,
    });
  } catch (error) {
    console.error("Error creating annotation:", error);
    return res.status(500).json({ error: "Failed to create annotation" });
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

    const annotations = await Annotation.find(query)
      .populate("userId", "username email");

    return res.json({ annotations });
  } catch (error) {
    console.error("Error fetching annotations:", error);
    return res.status(500).json({ error: "Failed to fetch annotations" });
  }
});

router.delete("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const annotation = await Annotation.findOne({
      _id: id,
      userId: req.session.user._id,
    });

    if (!annotation) {
      return res.status(404).json({ error: "Annotation not found" });
    }

    await Paper.findByIdAndUpdate(annotation.paperMongoId, {
      $pull: { annotations: annotation._id },
    });

    await Annotation.findByIdAndDelete(id);

    return res.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return res.status(500).json({ error: "Failed to delete annotation" });
  }
});

export default router;
