import fs from "fs";
import path from "path";
export function readJson(filePath) {
    return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf-8"));
}
export function writeJson(filePath, data) {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(data, null, 2));
}
