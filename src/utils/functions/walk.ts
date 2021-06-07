import { readdirSync, statSync } from "fs";
import { join } from "path";

export const walkSync = (files, fileDir, fileList = []) => {
  for (const file of files) {
    const absolutePath = join(fileDir, file);
    if (statSync(absolutePath).isDirectory()) {
      const dir = readdirSync(absolutePath);
      walkSync(dir, absolutePath, fileList);
    } else {
      fileList.push({ name: file, path: absolutePath });
    }
  }
  return fileList;
};
