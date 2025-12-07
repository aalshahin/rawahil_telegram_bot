import { readJson } from "../utils/file.js";
export class AdminsService {
    static PATH = "./src/data/admin.json";
    static getAll() {
        try {
            return readJson(this.PATH).admins;
        }
        catch {
            return [];
        }
    }
    static isAdmin(id) {
        return this.getAll().includes(id);
    }
}
