# Discord Gif Favourite Remover

This project provides a way to remove all gif favourites from a Discord user's settings by modifying the protobuf-encoded settings data.

## Why? 
Discord for some unholy cursed reason does not allow you to remove gif favourites apart from individually unfavouriting them which is a tedious process if you have many.
This script automates the process by directly modifying the protobuf data to remove all gif favourites in one go.

## Usage
1. Clone it
2. Install dependencies using `npm install`.
3. Run the script to remove gif favourites:
   ```bash
   node remove_gifs.js <auth_token>
   ```
   Replace `<auth_token>` with your Discord authentication token. [How?](https://gist.github.com/XielQs/90ab13b0c61c6888dae329199ea6aff3/)  
   The script will back up your original settings to a file named `settings_backup_<timestamp>.bin`.
5. (optional) If you need to restore your settings, use the `upload.js` script with the backup file:
   ```bash
   node upload.js <backup_file> <auth_token>
   ```
   Replace `<backup_file>` with the path to your backup file and `<auth_token>` with your Discord authentication token.

## Disclaimer

This code is janky. Use at your own risk :3