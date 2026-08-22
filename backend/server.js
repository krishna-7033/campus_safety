import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");

        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });

app.get("/", (req, res) => {
    res.json({
        message: "Campus Safety Backend Running",
    });
});

app.post("/api/users", async (req, res) => {
    try {
        const { clerkId, name, email } = req.body;

        let user = await User.findOne({ clerkId });

        if (user) {
            return res.status(200).json(user);
        }

        user = await User.create({
            clerkId,
            name,
            email,
        });

        res.status(201).json(user);
    } catch (error) {
        console.error("User save error:", error);

        res.status(500).json({
            message: "Failed to save user",
            error: error.message,
        });
    }
});