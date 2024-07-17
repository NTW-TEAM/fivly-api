import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { JavaAppService } from './javaApp.service';
import { Response } from 'express';
import { join } from 'path';
import * as process from "process";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';

@Controller('java-app')
export class JavaAppController {

  private readonly storagePath = process.env.JARS_DIRECTORY || join(__dirname, '..', '..', 'jars');
  constructor(private readonly downloadService: JavaAppService) {}

  @Get('download')
  downloadLastUpdate(@Res() res: Response): void {
    const latestJar = this.downloadService.getLatestVersion();
    const filePath = join(this.storagePath, latestJar);
    res.download(filePath, latestJar);
  }

  @Get('checkVersion')
  checkVersion(@Query('version') version: string): { isLatest: boolean } {
    const isLatest = this.downloadService.checkVersion(version);
    return { isLatest };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        console.log(`Saving file to: ${process.env.JARS_DIRECTORY || join(__dirname, '..', '..', 'jars')}`);
        cb(null, process.env.JARS_DIRECTORY || join(__dirname, '..', '..', 'jars'));
      },
      filename: (req, file, cb) => {
        console.log(`File name: ${file.originalname}`);
        cb(null, file.originalname);
      },
    }),
  }))
  uploadVersion(@UploadedFile() file: Express.Multer.File): { path: string } {
    const filePath = this.downloadService.uploadVersion(file);
    console.log(`Uploaded file path: ${filePath}`);
    return { path: filePath };
  }
}
