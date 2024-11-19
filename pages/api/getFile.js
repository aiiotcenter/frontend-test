import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  const dataDir = path.join(process.cwd(), "data"); // Use the dynamically created folder
  const filePath = path.join(dataDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileContents = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileContents);

    return res.status(200).json(jsonData);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error reading file", details: error.message });
  }
}
