import { Request, Response, Router } from "express";
import axios from "axios";
import Paper from "../models/Paper";
import User from "../models/User";
import { Types } from "mongoose";

const router = Router();
const BULK_SEARCH_URL =
  "http://api.semanticscholar.org/graph/v1/paper/search/bulk";
const RECOMMENDATIONS_URL =
  "https://api.semanticscholar.org/recommendations/v1/papers";
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

const fetchBulkPapers = (req: Request, res: Response) => {
  axios
    .get(BULK_SEARCH_URL, {
      params: {
        query: "computer science", // placeholder query, can be modified
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
};

// Fetch recommendations based on user's saved papers
const fetchRecommendations = async (req: any, res: any) => {
  const savedPaperIds = req.session.user.savedPapers.map((id: any) =>
    id.toString()
  );
  const savedPapers = await Paper.find({
    _id: { $in: savedPaperIds },
  });
  const realPositivePaperIds = savedPapers.map((paper: any) => paper.paperId);

  const data = {
    positivePaperIds: realPositivePaperIds,
    negativePaperIds: [], // placeholder until we have disliked/not interested papers
  };

  axios
    .post(RECOMMENDATIONS_URL, data, {
      params: {
        fields: "title,url,citationCount,authors",
        limit: "100",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations." });
    });
};

const getFollowersSavedPapers = async (userId: string) => {
  try {
    const user = await User.findById(userId).populate('following');
    if (!user || !user.following || user.following.length === 0) {
      return [];
    }

    const followerIds = user.following.map((follower: any) => follower._id);
    const followers = await User.find({ _id: { $in: followerIds } })
      .populate('savedPapers')
      .exec();

    const followersPapers: any[] = [];
    followers.forEach((follower: any) => {
      if (follower.savedPapers && follower.savedPapers.length > 0) {
        followersPapers.push(...follower.savedPapers);
      }
    });

    return followersPapers;
  } catch (error) {
    console.error("Error fetching followers' saved papers:", error);
    return [];
  }
};

const getSimilarUsersSavedPapers = async (userId: string, userInterests: string[]) => {
  try {
    if (!userInterests || userInterests.length === 0) {
      return [];
    }

    const similarUsers = await User.find({
      _id: { $ne: userId },
      interests: { $in: userInterests },
      savedPapers: { $exists: true, $ne: [] }
    })
    .populate('savedPapers')
    .limit(10) // Arbitrary limit to avoid performance issues
    .exec();

    const similarUsersPapers: any[] = [];
    similarUsers.forEach((user: any) => {
      if (user.savedPapers && user.savedPapers.length > 0) {
        similarUsersPapers.push(...user.savedPapers);
      }
    });

    return similarUsersPapers;
  } catch (error) {
    console.error("Error fetching similar users' saved papers:", error);
    return [];
  }
};

const getHybridRecommendations = async (req: any, res: any) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const savedPapers = await Paper.find({
      _id: { $in: user.savedPapers }
    });

    const followersPapers = await getFollowersSavedPapers((user._id as Types.ObjectId).toString());

    const similarUsersPapers = await getSimilarUsersSavedPapers((user._id as Types.ObjectId).toString(), user.interests);

    const query = user.interests && user.interests.length > 0 
      ? user.interests.join(" OR ") 
      : "computer science"; // fallback query
    
    const papersResponse = await axios.get(BULK_SEARCH_URL, {
      params: {
        query: query,
        fields: "title,fieldsOfStudy,abstract,url,openAccessPdf,publicationTypes,publicationDate,year",
        limit: 50,
      },
    });

    const papers = papersResponse.data.data;
    if (!papers || papers.length === 0) {
      return fetchBulkPapers(req, res);
    }

    const hybridRequest = {
      user_interests: user.interests || [],
      papers: papers.map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title,
        fieldsOfStudy: paper.fieldsOfStudy || [],
        abstract: paper.abstract || "",
        url: paper.url,
        openAccessPdf: paper.openAccessPdf,
        publicationDate: paper.publicationDate || null,
        year: paper.year || null,
      })),
      saved_papers: savedPapers.map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title,
        fieldsOfStudy: paper.fieldsOfStudy || [],
        abstract: paper.abstract || "",
        url: paper.url,
        openAccessPdf: paper.openAccessPdf,
        publicationDate: paper.publicationDate || null,
        year: paper.year || null,
      })),
      followers_saved_papers: followersPapers.map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title,
        fieldsOfStudy: paper.fieldsOfStudy || [],
        abstract: paper.abstract || "",
        url: paper.url,
        openAccessPdf: paper.openAccessPdf,
        publicationDate: paper.publicationDate || null,
        year: paper.year || null,
      })),
      similar_users_saved_papers: similarUsersPapers.map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title,
        fieldsOfStudy: paper.fieldsOfStudy || [],
        abstract: paper.abstract || "",
        url: paper.url,
        openAccessPdf: paper.openAccessPdf,
        publicationDate: paper.publicationDate || null,
        year: paper.year || null,
      })),
    };

    const fastapiResponse = await axios.post(
      `${FASTAPI_URL}/hybrid-recommend-papers`,
      hybridRequest
    );

    const responseData = fastapiResponse.data;
    const papersWithScores = papers.map((paper: any, index: number) => ({
      ...paper,
      score: responseData.similarities[index] || 0,
      content_score: responseData.content_scores ? responseData.content_scores[index] || 0 : 0,
      collaborative_score: responseData.collaborative_scores ? responseData.collaborative_scores[index] || 0 : 0,
    }));

    res.json({
      data: papersWithScores.sort((a: any, b: any) => b.score - a.score),
      total_papers: responseData.total_items,
      user_interests: user.interests,
      saved_papers_count: savedPapers.length,
      followers_papers_count: followersPapers.length,
      similar_users_papers_count: similarUsersPapers.length,
      message: "Hybrid recommendations combining content-based and collaborative filtering.",
    });
  } catch (error) {
    console.error("Error fetching hybrid recommendations:", error);
    await getPersonalizedRecommendations(req, res);
  }
};

const getPersonalizedRecommendations = async (req: any, res: any) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.interests || user.interests.length === 0) {
      fetchBulkPapers(req, res);
      return;
    }

    const papersResponse = await axios.get(BULK_SEARCH_URL, {
      params: {
        query: user.interests.join(" OR "),
        fields:
          "title,fieldsOfStudy,abstract,url,openAccessPdf,publicationTypes,publicationDate,year",
        limit: 50,
      },
    });

    const papers = papersResponse.data.data;
    if (!papers || papers.length == 0) {
      return fetchBulkPapers(req, res);
    }

    const savedPapers = await Paper.find({
      _id: { $in: user.savedPapers }
    });

    const fastapiRequest = {
      user_interests: user.interests,
      papers: papers.map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title,
        fieldsOfStudy: paper.fieldsOfStudy || [],
        abstract: paper.abstract || "",
        url: paper.url,
        openAccessPdf: paper.openAccessPdf,
        publicationDate: paper.publicationDate || null,
        year: paper.year || null,
      })),
      saved_papers: savedPapers.map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title,
        fieldsOfStudy: paper.fieldsOfStudy || [],
        abstract: paper.abstract || "",
        url: paper.url,
        openAccessPdf: paper.openAccessPdf,
        publicationDate: paper.publicationDate || null,
        year: paper.year || null,
      })),
    };

    const fastapiResponse = await axios.post(
      `${FASTAPI_URL}/recommend-papers`,
      fastapiRequest
    );

    const similarities = fastapiResponse.data.similarities;

    const papersWithScores = papers.map((paper: any, index: number) => ({
      ...paper,
      score: similarities[index] || 0,
    }));

    res.json({
      data: papersWithScores.sort((a: any, b: any) => b.score - a.score),
      total_papers: fastapiResponse.data.total_papers,
      user_interests: user.interests,
      message: "Personalized recommendations based on user interests.",
    });
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    fetchBulkPapers(req, res); // Fallback if error occurs
  }
};

router.get("/", (req: any, res: any) => {
  fetchBulkPapers(req, res);
});

router.get("/recommendations", async (req: any, res: any) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User not authenticated." });
  }
  try {
    if (
      !req.session.user.savedPapers ||
      req.session.user.savedPapers.length === 0
    ) {
      fetchBulkPapers(req, res);
      return;
    } else {
      await fetchRecommendations(req, res);
      return;
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations." });
  }
});

router.get("/personalized", async (req: any, res: any) => {
  await getPersonalizedRecommendations(req, res);
});

router.get("/hybrid", async (req: any, res: any) => {
  await getHybridRecommendations(req, res);
});


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
    }

    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (!user.savedPapers.some((id: any) => id.equals(paper._id))) {
      user.savedPapers.push(paper._id as (typeof user.savedPapers)[0]);
      await user.save();
    }
    return res.status(201).json({ message: "Paper saved successfully.", paper });
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

router.post("/delete/:paperId", async (req: any, res: any) => {
  const { paperId } = req.params;
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User not authenticated." });
  }
  try {
    const paper = await Paper.findOne({ paperId });
    if (!paper) {
      return res.status(404).json({ error: "Paper not found." });
    }

    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    user.savedPapers = user.savedPapers.filter(
      (id: any) => !id.equals(paper._id)
    );
    await user.save();
    return res.status(200).json({ message: "Paper unsaved successfully." });
  } catch (error) {
    console.error("Error unsaving paper:", error);
    return res.status(500).json({ error: "Failed to unsave paper." });
  }
});

export default router;
