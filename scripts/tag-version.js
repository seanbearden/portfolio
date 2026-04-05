const { version } = require("../package.json");
const { execSync } = require("child_process");
const tag = `v${version}`;
execSync(`git tag ${tag}`);
console.log(`Tagged ${tag}`);
