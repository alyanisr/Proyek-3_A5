import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Route untuk menampilkan landingpage.html
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/landingpage.html'));
});

export default router;