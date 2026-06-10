import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PASSWORD_FILE = join(process.cwd(), ".ayronex-security.json");

export function getCurrentPassword() {
  if (existsSync(PASSWORD_FILE)) {
    try {
      const data = JSON.parse(readFileSync(PASSWORD_FILE, "utf8")) as { password?: string };
      return data.password || process.env.ERP_PASSWORD || "ayronex123";
    } catch {
      return process.env.ERP_PASSWORD || "ayronex123";
    }
  }

  return process.env.ERP_PASSWORD || "ayronex123";
}

export function saveCurrentPassword(password: string) {
  writeFileSync(PASSWORD_FILE, JSON.stringify({ password, updatedAt: new Date().toISOString() }, null, 2));
}
