import connectDB from "../../../utils/db.js";
import HomeOwner from "../../../models/HomeOwner.js";

export default async function handler(req, res) {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://roomdekhoo.netlify.app"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();
    const { ownerId, ...updates } = req.body;
    const updatedOwner = await HomeOwner.findByIdAndUpdate(
      ownerId,
      updates,
      { new: true }
    );
    res.status(200).json(updatedOwner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
