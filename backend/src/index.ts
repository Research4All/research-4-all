import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response, Application } from "express";
import session from "express-session";
import connectDB from "./db/database";

dotenv.config();
const PORT: number = Number(process.env.PORT) || 5000;
const FRONTEND_URL: string =
  process.env.FRONTEND_URL || "http://localhost:5173";
const FASTAPI_URL: string = process.env.FASTAPI_URL || "http://localhost:8000";

// Connect to the database
connectDB();

// Import routes
import authRouter from "./routes/auth";
import paperRouter from "./routes/paper";
import userRouter from "./routes/user";
import annotationRouter from "./routes/annotation";
import highlightRouter from "./routes/highlight";
import axios from "axios";

const app: Application = express();
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not defined in .env file");
}

let sessionConfig = {
  name: "sessionId",
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.RENDER ? true : false,
    httpOnly: true, // look into this more later
  },
  resave: false,
  saveUninitialized: false,
};

const authMiddleware = (req: any, res: Response, next: any) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.use(session(sessionConfig));
app.use("/api/auth", authRouter);
app.use("/api/papers", paperRouter);
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/annotations", authMiddleware, annotationRouter);
app.use("/api/highlights", authMiddleware, highlightRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.get("/data_from_fastapi", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from FastAPI" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
