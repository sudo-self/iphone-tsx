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
let env = "";

// Read existing .env.local if it exists
if (fs.existsSync(envPath)) {
  env = fs.readFileSync(envPath, "utf8");
  // Remove old hash line
  env = env
    .split("\n")
    .filter(line => !line.startsWith("NEXT_PUBLIC_BUILD_HASH="))
    .join("\n")
    .trim();
}

// Append or update the build hash
const newEnv = `${env}\nNEXT_PUBLIC_BUILD_HASH=${buildHash}\n`;

fs.writeFileSync(envPath, newEnv);
console.log(`✅ Build hash written to ${envPath}: ${buildHash}`);

