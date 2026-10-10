import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const configPath = fileURLToPath(new URL("../open-next.config.ts", import.meta.url));
const config = `import { defineCloudflareConfig } from "@opennextjs/cloudflare";\n\nexport default defineCloudflareConfig({});\n`;

await writeFile(configPath, config, "utf8");
