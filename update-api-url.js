import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Configuration
const LOCAL_URL = 'http://localhost:3000';
const RENDER_URL = 'https://inty-backend.onrender.com';

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIRECTORY_PATH = path.join(__dirname, 'src');

// Function to replace in a file
function replaceInFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all instances of the local URL with the Render URL
    const updatedContent = content.replace(new RegExp(LOCAL_URL.replace(/[:/.]/g, '\\$&'), 'g'), RENDER_URL);
    
    // Only write to the file if changes were made
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing file: ${filePath}`, error);
    return false;
  }
}

// Function to process all files in a directory recursively
function processDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  let count = 0;
  
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
        count += processDirectory(filePath);
      }
    } else if (stats.isFile()) {
      // Only process certain file types
      const ext = path.extname(file).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css'].includes(ext)) {
        if (replaceInFile(filePath)) {
          count++;
        }
      }
    }
  }
  
  return count;
}

// Main execution
console.log(`🔄 Replacing ${LOCAL_URL} with ${RENDER_URL} in all files...`);
const totalFilesUpdated = processDirectory(DIRECTORY_PATH);
console.log(`✅ Done! Updated ${totalFilesUpdated} files.`);

// Notify to update environment variables
console.log('\n⚠️ IMPORTANT: Also update your .env file manually:');
console.log(`VITE_API_URL=${RENDER_URL}/api`); 