import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import userRoutes from "./routes/user.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";


const app = express();

dotenv.config(); 

const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Uzima API");
});
app.use("/users", userRoutes);
app.use("/hospital", hospitalRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
