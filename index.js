import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.get("/",(req,res) => {
    res.send("hello world")
})


mongoose.connect("mongodb://127.0.0.1:27017/authentication", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Database connected");
}).catch((err) => {
  console.error("Error connecting to the database:", err);
});

app.use(express.json());

app.use('/auth', authRoutes);
const port = 3000;


app.listen(port , () => {
    console.log(`server started at port ${port}`);
})