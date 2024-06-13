import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  NotFoundException, Query,
} from "@nestjs/common";
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
  async addFile(@Body('path') path: string, @Body('name') name: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    return this.gedService.addFile(path, name, file.buffer);
  }

  // TODO: check if it works
  @Delete('file/:path')
  async deleteFile(@Param('path') path: string) {
    return this.gedService.deleteFile(path);
  }

  // WORKS WELL
  @Delete('folder')
  async deleteFolder(@Query('path') path: string) {
    return this.gedService.deleteFolder(path);
  }

  // WORKS WELL
  @Put('file/move')
  async moveFile(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    return this.gedService.moveFile(oldPath, newPath);
  }

  // WORKS WELL
  @Put('folder/move')
  async moveFolder(@Body('oldPath') oldPath: string, @Body('newPath') newPath: string) {
    return this.gedService.moveFolder(oldPath, newPath);
  }

  // TODO: check if it works
  @Put('file/rename')
  async renameFile(@Body('path') path: string, @Body('newName') newName: string) {
    return this.gedService.renameFile(path, newName);
  }

  // TODO: check if it works
  @Put('folder/rename')
  async renameFolder(@Body('path') path: string, @Body('newName') newName: string) {
    return this.gedService.renameFolder(path, newName);
  }

  // TODO: check if it works
  @Post('permission')
  async addPermissionToPath(@Body('path') path: string, @Body('userId') userId: number, @Body('roleId') roleId: string, @Body('access') access: Access) {
    return this.gedService.addPermissionToPath(path, userId, roleId, access);
  }

  // WORKS WELL
  @Get('file/download')
  async downloadFile(@Query('path') path: string, @Res() res: Response) {
    const file = await this.gedService.downloadFile(path);
    res.setHeader('Content-Disposition', `attachment; filename=${path.split('/').pop()}`);
    res.send(file);
  }

  // FIXME: does not seems to work
  @Get('folder/download')
  async downloadFolder(@Query('path') path: string, @Res() res: Response) {
    const folder = await this.gedService.downloadFolder(path);
    res.setHeader('Content-Disposition', `attachment; filename=${path.split('/').pop()}.zip`);
    res.send(folder);
  }

  // TODO: check if it works
  @Get('folder/contents')
  async listFolderContents(@Body('path') path: string) {
    return this.gedService.listFolderContents(path);
  }

  // TODO: check if it works
  @Get('folder/subfolders')
  async listSubFolders(@Body('path') path: string) {
    return this.gedService.listSubFolders(path);
  }

}


  // Ajouter un dossier dans un dossier(path) (si path = "/", alors à la racine)
  // Ajouter un fichier dans un dossier(path) (si path = "/", alors à la racine)
  // Supprimer un fichier(path)
  // Supprimer un dossier(path) (et tout son contenu)
  // Déplacer un fichier(path)
  // Déplacer un dossier(path) (et tout son contenu)
  // Renommer un fichier(path)
  // Renommer un dossier(path)
  // Ajouter un utilisateur/rôle à fichier/dossier(path) (si path = "/", alors à la racine)
  // Télécharger un fichier(path)
  // Télécharger un dossier(path) (et tout son contenu) (zip)
  // Lister le contenu d'un dossier(path) (si path = "/", alors à la racine) (ne pas lister les sous-dossiers et sous-fichiers, lister seulement les dossiers et fichiers du dossier demandé)
  // Lister les sous-dossiers d'un dossier(path) (si path = "/", alors à la racine)