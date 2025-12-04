import fs from "fs";
import path from "path";

export function readJson(filePath: string) {
    return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf-8"));
}

export function writeJson(filePath: string, data: any) {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(data, null, 2));
}