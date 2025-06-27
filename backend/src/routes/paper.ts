import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", (req: any, res: any) => {
  axios
    .get("http://api.semanticscholar.org/graph/v1/paper/search/bulk", 
      {
          params: {
            query: "generative ai",
            fields: "title,url,publicationTypes,publicationDate,openAccessPdf",
            year: 2023,
          }
      }
    )
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error("Error fetching papers:", error);
      res.status(500).json({ error: "Failed to fetch papers." });
    });
});

export default router;
