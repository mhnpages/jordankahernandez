import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const configUrl = new URL("../dist/server/wrangler.json", import.meta.url);
const configPath = fileURLToPath(configUrl);
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
const databaseName = process.env.CLOUDFLARE_D1_DATABASE_NAME || "jordanka-rsvp";

if (!databaseId) {
  throw new Error("Falta CLOUDFLARE_D1_DATABASE_ID. Copia el ID de la base D1 en esta variable de entorno.");
}

const config = JSON.parse(await readFile(configPath, "utf8"));
const database = config.d1_databases?.find((entry) => entry.binding === "DB");

if (!database) {
  throw new Error("La compilación no generó el binding D1 llamado DB.");
}

config.name = "jordanka-sweet-sixteen";
config.topLevelName = "jordanka-sweet-sixteen";
database.database_id = databaseId;
database.database_name = databaseName;
database.migrations_dir = "../../drizzle";

await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
console.log(`Configuración preparada para ${databaseName}.`);
