import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, Application } from "express";

const app: Application = express();

const PORT: number = Number(process.env.PORT) || 5000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
