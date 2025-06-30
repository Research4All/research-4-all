import { Router } from "express";
import axios from "axios";
import Paper from "../models/Paper";

const router = Router();

router.get("/", (req: any, res: any) => {
  axios
    .get("http://api.semanticscholar.org/graph/v1/paper/search/bulk", {
      params: {
        query: "generative ai",
        fields: "title,url,publicationTypes,publicationDate,openAccessPdf",
        year: 2023,
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

  try {
    let existingPaper = await Paper.findOne({ paperId });
    if (existingPaper) {
      console.log("Paper already exists in the database:", existingPaper);
      return res
        .status(200)
        .json({ message: "Paper already exists in favorites." });
    }
    const newPaper = await Paper.create({
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
    console.log("New paper created:", newPaper);
  } catch (error) {
    console.error("Error saving paper:", error);
    return res.status(500).json({ error: "Failed to save paper." });
  }
  res.status(201).json({ message: "Paper saved successfully." });
});

export default router;
