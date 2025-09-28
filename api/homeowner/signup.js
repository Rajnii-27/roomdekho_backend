import connectDB from "../../../utils/db.js";
import { signupUser } from "../../../controllers/userController.js";

export default async function handler(req, res) {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://roomdekhoo.netlify.app"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectDB();
    await signupUser(req, res); // reuse controller logic
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
