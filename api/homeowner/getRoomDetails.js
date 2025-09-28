import connectDB from "../../../utils/db.js";
import HomeOwner from "../../../model/userModel.js";

export default async function handler(req, res) {
  const allowedOrigins = ["http://localhost:5173","https://roomdekhoo.netlify.app"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectDB();
    const { id } = req.query;
    const profile = await HomeOwner.findById(id);
    if (!profile) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
