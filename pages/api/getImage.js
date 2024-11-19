import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  // Path to the image file
  const dataDir = path.join(process.cwd(), "data/images"); // Replace "data" with the directory where your images are stored
  const filePath = path.join(dataDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Read the image file
    const fileStream = fs.createReadStream(filePath);

    // Set the appropriate content type (e.g., image/jpeg, image/png)
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
      }[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    fileStream.pipe(res); // Stream the image to the response
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error fetching image", details: error.message });
  }
}
