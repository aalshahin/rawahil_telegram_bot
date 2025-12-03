import fs from "fs";
import path from "path";

const ADMIN_PATH = path.resolve("./src/data/admin.json");
export class AdminsService {
  static load(): number[] {
    try {
      return JSON.parse(fs.readFileSync(ADMIN_PATH, "utf-8")).admins;
    } catch {
      return [];
    }
  }

  static isAdmin(userId: number): boolean {
    return this.load().includes(userId);
  }
}
