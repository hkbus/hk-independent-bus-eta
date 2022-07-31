import { promisify } from "util";
import { exec } from "child_process";
import config from "dotenv";
import fs from "fs/promises";
import os from "os";
const { parsed } = config.config();
(async () => {
  if (parsed === undefined) {
    return;
  }
  try {
    const result = await promisify(exec)("git rev-parse --short HEAD");
    parsed.NEXT_COMMIT_HASH = result.stdout;
  } catch {}
  try {
    const result = await promisify(exec)("git log -1 --pretty=format:%s");
    parsed.NEXT_COMMIT_MESSAGE = result.stdout;
  } catch {}
  try {
    const file = await fs.readFile("./package.json", "utf8");
    const packageJson = JSON.parse(file);
    parsed.NEXT_APP_VERSION = packageJson.version;
  } catch {}
  try {
    const result = await promisify(exec)("git config --get remote.origin.url");
    parsed.NEXT_REPO_URL = result.stdout;
  } catch {}
  await fs.writeFile(
    "./.env",
    Object.entries(parsed)
      .map(([key, value]) => `${key}=${value}`)
      .join(os.EOL)
  );
})();
