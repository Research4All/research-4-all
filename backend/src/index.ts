import dotenv from "dotenv";
import express, { Request, Response, Application } from "express";
const session = require("express-session");

dotenv.config();
const PORT: number = Number(process.env.PORT) || 5000;

// Import routes
const authRouter = require("./routes/auth");

const app: Application = express();
app.use(express.json());

let sessionConfig = {
  name: "sessionId",
  secret: process.env.SESSION_SECRET || "defaultSecret",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.RENDER ? true: false,
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,
}

app.use(session(sessionConfig));
app.use(authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
