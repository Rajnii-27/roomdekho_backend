import connectDB from "../../../utils/db.js";
import { filterRoomsController } from "../../../controllers/userController.js";

export default async function handler(req, res) {
  const allowedOrigins = ["http://localhost:5173","https://roomdekhoo.netlify.app"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
    await filterRoomsController(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
