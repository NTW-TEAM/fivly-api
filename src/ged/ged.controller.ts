import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Query,
  Request,
} from '@nestjs/common';
import { GedService } from './ged.service';
import { Access } from './permission.entity';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

const storage = multer.memoryStorage();

@Controller('ged')
export class GedController {
  constructor(private readonly gedService: GedService) {}

  // WORKS WELL
  @Post('folder')
  async addFolder(@Body('path') path: string, @Body('name') name: string) {
    return this.gedService.addFolder(path, name);
  }

  // WORKS WELL
  @Post('file')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async addFile(
    @Body('path') path: string,
    @Body('name') name: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    return this.gedService.addFile(path, name, file.buffer);
  }

  // WORKS WELL
  @Delete('file')
  async deleteFile(@Query('path') path: string) {
    return this.gedService.deleteFile(path);
  }

  // WORKS WELL
  @Delete('folder')
  async deleteFolder(@Query('path') path: string) {
    return this.gedService.deleteFolder(path);
  }

  // WORKS WELL
  @Put('file/move')
  async moveFile(
    @Body('oldPath') oldPath: string,
    @Body('newPath') newPath: string,
  ) {
    return this.gedService.moveFile(oldPath, newPath);
  }

  // WORKS WELL
  @Put('folder/move')
  async moveFolder(
    @Body('oldPath') oldPath: string,
    @Body('newPath') newPath: string,
  ) {
    return this.gedService.moveFolder(oldPath, newPath);
  }

  // WORKS WELL
  @Put('file/rename')
  async renameFile(
    @Body('path') path: string,
    @Body('newName') newName: string,
  ) {
    return this.gedService.renameFile(path, newName);
  }

  // WORKS WELL
  @Put('folder/rename')
  async renameFolder(
    @Body('path') path: string,
    @Body('newName') newName: string,
  ) {
    return this.gedService.renameFolder(path, newName);
  }

  // TODO: check if it works
  @Post('permission')
  async addPermissionToPath(
    @Body('path') path: string,
    @Body('userId') userId: number,
    @Body('roleId') roleId: string,
    @Body('access') access: Access,
  ) {
    return this.gedService.addPermissionToPath(path, userId, roleId, access);
  }

  // WORKS WELL
  @Get('file/download')
  async downloadFile(@Query('path') path: string, @Res() res: Response) {
    // check if file exists
    const fileExists = await this.gedService.fileExists(path);
    if (!fileExists) {
      throw new NotFoundException('File not found');
    }
    const file = await this.gedService.downloadFile(path);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${path.split('/').pop()}`,
    );
    res.send(file);
  }

  // FIXME: does not seems to work
  @Get('folder/download')
  async downloadFolder(@Query('path') path: string, @Res() res: Response) {
    try {
      const folderBuffer = await this.gedService.downloadFolder(path);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${path.split('/').pop()}.zip`,
      );
      res.setHeader('Content-Type', 'application/zip');
      res.send(folderBuffer);
    } catch (error) {
      res
        .status(500)
        .send({ message: 'Failed to download folder', error: error.message });
    }
  }

  // WORKS WELL
  @Post('folder/contents')
  async listFolderContents(@Body('path') path: string, @Request() req: any) {
    return this.gedService.listFolderContents(req.user.id, path);
  }

  // WORKS WELL
  @Post('folder/subfolders')
  async listSubFolders(@Body('path') path: string, @Request() req: any) {
    return this.gedService.listSubFolders(req.user.id, path);
  }
}
