import fs from "fs";
import fetch from "node-fetch";

// This uploads XYZ.bin to discord using their internal API.
// Usage: node upload.js input.bin (base64 encoded protobuf) <auth_token>

if (process.argv.length !== 4) {
  console.error("usage: node upload.js <input.bin> <auth_token>");
  process.exit(1);
}

const inputPath = process.argv[2];
const authToken = process.argv[3];

// read raw protobuf bytes
const base64 = fs.readFileSync(inputPath, "utf8").trim();
const buffer = Buffer.from(base64, "base64");

// Encode to { settings: <base64 string> }
const payload = {
  settings: buffer.toString("base64"),
};

// PATCH to https://discord.com/api/v9/users/@me/settings-proto/2
fetch("https://discord.com/api/v9/users/@me/settings-proto/2", {
  method: "PATCH",
  headers: {
    "Authorization": authToken,
    "Content-Type": "application/json",
    "User-Agent": "Discord/0.0.119",
  },
  body: JSON.stringify(payload),
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Upload successful:", data);
  })
  .catch(error => {
    console.error("Error uploading settings:", error);
  });

console.log("Upload initiated.");