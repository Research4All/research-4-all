import { Request, Response, Router } from "express";
import axios from "axios";

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

export default router;
