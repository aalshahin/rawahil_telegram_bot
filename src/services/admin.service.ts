import { readJson } from "../utils/file.js";

export class AdminsService {
  private static PATH = "./src/data/admin.json";

  static getAll(): number[] {
    try {
      return readJson(this.PATH).admins;
    } catch {
      return [];
    }
  }

  static isAdmin(id: number): boolean {
    return this.getAll().includes(id);
  }
}