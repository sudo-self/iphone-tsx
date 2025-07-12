// scripts/generate-build-hash.js

const { execSync } = require("child_process");
const fs = require("fs");

let buildHash;

try {
  buildHash = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  buildHash = Date.now().toString(36); 
}

const envPath = ".env.local";
const content = `NEXT_PUBLIC_BUILD_HASH=${buildHash}\n`;

fs.writeFileSync(envPath, content);
console.log(`✅ Build hash written to ${envPath}: ${buildHash}`);
