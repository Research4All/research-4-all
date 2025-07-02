import { Request, Response, Router } from "express";
import axios from "axios";
import Paper from "../models/Paper";
import User from "../models/User";

const router = Router();
const BULK_SEARCH_URL =
  "http://api.semanticscholar.org/graph/v1/paper/search/bulk";

router.get("/", (req: Request, res: Response) => {
  axios
    .get(BULK_SEARCH_URL, {
      params: {
        query: "",
        fields: "title,url,publicationTypes,publicationDate,openAccessPdf",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error("Error fetching papers:", error);
      res.status(500).json({ error: "Failed to fetch papers." });
    });
});

// Save paper to user's favorites
// Creates a new paper in the database if it doesn't already exist
// TODO: Add paper id to user's favorites list
router.post("/save", async (req: any, res: any) => {
  const {
    paperId,
    title,
    abstract,
    url,
    openAccessPdf,
    fieldsOfStudy,
    publicationDate,
    publicationTypes,
    authors,
  } = req.body;

  if (!paperId || !title) {
    return res.status(400).json({ error: "Paper ID and title are required." });
  }
  if (!req.session || !req.session.user) {
    console.log(req.session);
    return res.status(401).json({ error: "User not authenticated." });
  }

  try {
    let paper = await Paper.findOne({ paperId });
    if (!paper) {
      paper = await Paper.create({
        paperId,
        title,
        abstract,
        url,
        openAccessPdf,
        fieldsOfStudy,
        publicationDate,
        publicationTypes,
        authors,
      });
      console.log("New paper created:", paper);
    } else {
      console.log("Paper already exists in the database:", paper);
    }

    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (!user.savedPapers.some((id: any) => id.equals(paper._id))) {
      user.savedPapers.push(paper._id as (typeof user.savedPapers)[0]);
      await user.save();
    }
    return res.status(201).json({ message: "Paper saved successfully." });
  } catch (error) {
    console.error("Error saving paper:", error);
    return res.status(500).json({ error: "Failed to save paper." });
  }
});

router.get("/saved", async (req: any, res: any) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User not authenticated." });
  }
  try {
    const user = await User.findById(req.session.user._id)
      .select("savedPapers")
      .populate("savedPapers")
      .exec();
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({ savedPapers: user.savedPapers });
  } catch (error) {
    console.error("Error fetching saved papers:", error);
    return res.status(500).json({ error: "Failed to fetch saved papers." });
  }
});

export default router;
