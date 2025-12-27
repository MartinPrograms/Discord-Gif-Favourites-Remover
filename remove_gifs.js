// Top level removal of the 'favorites' field inside 'gifs'
// Usage: node remove_gifs.js <auth_token>
import fs from "fs";
import fetch from "node-fetch";
import { removeFavourites } from "./decode.js";

if (process.argv.length !== 3) {
  console.error("usage: node remove_gifs.js <auth_token>");
  process.exit(1);
}

const authToken = process.argv[2];

// Fetch current settings
async function fetchSettings() {
  const response = await fetch("https://discord.com/api/v9/users/@me/settings-proto/2", {
    method: "GET",
    headers: {
      "Authorization": authToken,
      "User-Agent": "Discord/0.0.119",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return Buffer.from(data.settings, "base64");
}

// Upload modified settings
async function uploadSettings(buffer) {
  const payload = {
    settings: buffer.toString("base64"),
  };

  const response = await fetch("https://discord.com/api/v9/users/@me/settings-proto/2", {
    method: "PATCH",
    headers: {
      "Authorization": authToken,
      "Content-Type": "application/json",
      "User-Agent": "Discord/0.0.119",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.log("Upload successful."); // We do not need the body, its literally the entire settings again (waste of bandwidth)
}

// Main function
(async () => {
  try {
    const originalBuffer = await fetchSettings();
    const cleanedBuffer = removeFavourites(originalBuffer);
    if (originalBuffer.length === cleanedBuffer.length) {
      console.log("No GIF favorites found to remove.");
      return;
    }

    // Create backup
    if (!fs.existsSync("./backups")) {
      fs.mkdirSync("./backups");
    }
    const backupFilename = `./backups/settings_backup_${Date.now()}.bin`;
    fs.writeFileSync(backupFilename, originalBuffer.toString("base64"));
    console.log(`Backup of original settings saved to ${backupFilename}`);


    await uploadSettings(cleanedBuffer);
    console.log("All GIF favorites removed and settings uploaded.");
    console.log("If you encounter any issues, use the ./upload.js script with the backup file to restore your settings.");
    console.log(`Backup file: ${backupFilename}`);
    console.log("Usage: node upload.js <backup_file> <auth_token>");
    console.log("goobai :3 -kim")
  } catch (error) {
    console.error("Error:", error);
  }
})();