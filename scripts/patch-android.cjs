const fs = require("node:fs");
const path = require("node:path");

const manifestPath = path.join("android", "app", "src", "main", "AndroidManifest.xml");
if (!fs.existsSync(manifestPath)) {
  throw new Error("AndroidManifest.xml was not generated. Run npx cap add android first.");
}
let manifest = fs.readFileSync(manifestPath, "utf8");
const activityPattern = /<activity\b(?=[^>]*android:name="[^"]*MainActivity")[^>]*>/s;
const match = manifest.match(activityPattern);
if (!match) {
  throw new Error("Could not find MainActivity in AndroidManifest.xml");
}
let activityTag = match[0];
if (/android:screenOrientation=/.test(activityTag)) {
  activityTag = activityTag.replace(/android:screenOrientation="[^"]*"/, 'android:screenOrientation="landscape"');
} else {
  activityTag = activityTag.replace(/>$/, ' android:screenOrientation="landscape">');
}
manifest = manifest.replace(activityPattern, activityTag);
fs.writeFileSync(manifestPath, manifest);
console.log("MainActivity orientation set to landscape.");
