import { Injectable, NotFoundException } from "@nestjs/common";
import { join } from 'path';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import * as process from "process";

@Injectable()
export class JavaAppService {
  private readonly versionsDirectory = process.env.JARS_DIRECTORY || join(__dirname, '..', '..', 'jars');

  constructor() {
    if (!existsSync(this.versionsDirectory)) {
      mkdirSync(this.versionsDirectory, { recursive: true });
    }
  }

  getLatestVersion(): string {
    const files = readdirSync(this.versionsDirectory);
    const jarFiles = files.filter(file => file.endsWith('.jar'));

    if (jarFiles.length === 0) {
      throw new NotFoundException('No jar files found');
    }

    const sortedJarFiles = jarFiles.sort((a, b) => {
      const versionA = this.extractVersion(a);
      const versionB = this.extractVersion(b);
      return versionB.localeCompare(versionA);
    });

    return sortedJarFiles[0];
  }

  uploadVersion(file: Express.Multer.File): string {
    const targetPath = join(this.versionsDirectory, file.originalname);
    // The file has already been saved to disk by multer, so we just need to return the path or handle any post-processing if needed.
    return targetPath;
  }

  checkVersion(version: string): boolean {
    const latestVersion = this.getLatestVersion();
    console.log(`Latest version: ${this.extractVersion(latestVersion)}`);
    console.log(`Requested version: ${version}`);
    return version === this.extractVersion(latestVersion);
  }

  private extractVersion(filename: string): string {
    const match = filename.match(/app-(\d+\.\d+\.\d+)\.jar/);
    return match ? match[1] : '0.0.0';
  }
}
