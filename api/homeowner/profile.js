import connectDB from "../../../utils/db.js";
import { getHomeOwnerProfile, updateHomeOwnerProfile } from "../../../controllers/userController.js";
import authMiddleware from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/uploadMiddleware.js";
import { body, validationResult } from "express-validator";

// Validation rules
const profileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isLength({ min: 10 }).withMessage('Phone must be at least 10 digits'),
  body('address').notEmpty().withMessage('Address is required'),
  body('pincode').isPostalCode('IN').withMessage('Valid pincode is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('resourcesAvailable').optional().isString(),
  body('otherBills').optional().isString(),
  body('cost').optional().isNumeric()
];

export default async function handler(req, res) {
  const allowedOrigins = ["http://localhost:5173","https://roomdekhoo.netlify.app"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  await connectDB();

  try {
    // GET profile
    if (req.method === "GET") {
      await authMiddleware(req, res, async () => {
        await getHomeOwnerProfile(req, res);
      });
    }

    // PUT profile
    else if (req.method === "PUT") {
      await authMiddleware(req, res, async () => {
        // Multer upload
        await upload(req, res, async (err) => {
          if (err) return res.status(400).json({ error: err.message });

          // Express-validator check
          const errors = validationResult(req);
          if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

          await updateHomeOwnerProfile(req, res);
        });
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
