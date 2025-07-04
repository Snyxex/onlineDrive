import express from "express";
import connectToMongo from "./src/DB/db";
import authRoutes from "./src/routes/user";
import cors from 'cors'
import env from 'dotenv'
const app = express();

connectToMongo();

env.config();

const PORT = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working ....");
});

app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log("----connected with express server on PORT " + PORT);
});