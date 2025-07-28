import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response, Application } from "express";
import session from "express-session";
import connectDB from "./db/database";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Socket } from "socket.io";

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

import type { IAnnotation } from "./models/Annotation";
import type { IHighlight } from "./models/Highlight";

const app: Application = express();

if (process.env.RENDER) {
  app.set('trust proxy', 1);
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000", 
  "https://research-4-all.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
    httpOnly: true,
    sameSite: process.env.RENDER ? 'none' as const : 'lax' as const, // Required for cross-domain cookies
    path: '/',
  },
  resave: false,
  saveUninitialized: false,
  proxy: process.env.RENDER ? true : false,
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

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected", socket.id);

  socket.on("join-document", (paperId: string) => {
    socket.join(paperId);
    console.log(`Socket ${socket.id} joined document ${paperId}`);
  });

  socket.on("annotation-update", ({ paperId, annotation }: { paperId: string; annotation: IAnnotation }) => {
    socket.to(paperId).emit("annotation-update", { annotation });
  });
  socket.on("highlight-update", ({ paperId, highlight }: { paperId: string; highlight: IHighlight }) => {
    socket.to(paperId).emit("highlight-update", { highlight });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
