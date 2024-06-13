import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './folder.entity';
import { File } from './file.entity';
import * as Minio from 'minio';
import { User } from '../user/user.entity';
import { Role } from '../roles/role.entity';
import { Permission, Access } from './permission.entity';
import * as archiver from 'archiver';
import * as streamBuffers from 'stream-buffers';

@Injectable()
export class GedService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName = process.env.MINIO_BUCKET_NAME || 'java-apps';

  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {
    const minioPort = process.env.MINIO_FIRST_PORT
      ? parseInt(process.env.MINIO_FIRST_PORT, 10)
      : 9000;
    const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const minioUseSSL = process.env.MINIO_USE_SSL === 'true';
    const minioAccessKey = process.env.MINIO_ROOT_USER || 'default-access-key';
    const minioSecretKey =
      process.env.MINIO_ROOT_PASSWORD || 'default-secret-key';

    // Log the Minio configuration properly and in a pretty way
    console.log('Minio configuration:');
    console.log(`Endpoint: ${minioEndpoint}`);
    console.log(`Port: ${minioPort}`);
    console.log(`Use SSL: ${minioUseSSL}`);
    console.log(`Access key: ${minioAccessKey}`);
    console.log(`Secret key: ${minioSecretKey}`);
    console.log(`Bucket name: ${this.bucketName}`);

    this.minioClient = new Minio.Client({
      endPoint: minioEndpoint,
      port: minioPort,
      useSSL: minioUseSSL,
      accessKey: minioAccessKey,
      secretKey: minioSecretKey,
    });

    // Ensure the bucket exists
    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'eu-west-1');
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  // WORKS WELL
  async addFolder(path: string, name: string): Promise<Folder> {
    const parentFolder = await this.folderRepository.findOne({ where: { path } });
    if (!parentFolder) throw new NotFoundException('Parent folder not found');
    const folder = new Folder();
    folder.name = name;
    folder.path = path === '/' ? `/${name}/` : `${path}${name}/`;
    folder.parentFolder = parentFolder;
    return this.folderRepository.save(folder);
  }

  // WORKS WELL
  async addFile(path: string, name: string, fileContent: Buffer): Promise<File> {
    const folder = await this.folderRepository.findOne({ where: { path } });
    if(!folder) throw new NotFoundException('Folder not found');
    const file = new File();
    file.name = name;
    file.path = path === '/' ? `/${name}` : `${path}${name}`;
    file.folder = folder;

    // Upload the file to MinIO
    await this.minioClient.putObject(this.bucketName, file.path, fileContent);

    return this.fileRepository.save(file);
  }

  async deleteFile(path: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { path } });
    if (!file) throw new NotFoundException('File not found');
    await this.fileRepository.remove(file);

    // Remove the file from MinIO
    await this.minioClient.removeObject(this.bucketName, path);
  }

  // WORKS WELL
  async deleteFolder(path: string): Promise<void> {
    const folder = await this.folderRepository.findOne({ where: { path } });
    if (!folder) throw new NotFoundException('Folder not found');

    // Remove files within the folder
    await this.fileRepository.createQueryBuilder()
      .delete()
      .from(File)
      .where("path like :path", { path: `${path}%` })
      .execute();
    console.log('Files removed');

    // Remove subfolders of targeted folder in the database first using query builder
    await this.folderRepository.createQueryBuilder()
      .delete()
      .from(Folder)
      .where("path like :path", { path: `${path}%` })
      .execute();
    console.log('Subfolders removed');

    // Remove targeted folder
    await this.folderRepository.remove(folder);
    console.log('Targeted folder removed');

    // remove first / from path
    const minioPathWithoutFirstSlash = path.substring(1);

    // Remove all files and subfolders from MinIO
    const objectsStream = this.minioClient.listObjectsV2(this.bucketName, minioPathWithoutFirstSlash, true);
    const objectsList = [];

    for await (const obj of objectsStream) {
      if (obj.name) {
        objectsList.push(obj.name);
        console.log(`Found object: ${obj.name}`);
      }
    }

    if (objectsList.length === 0) {
      console.log('No objects found to delete.');
    } else {
      for (const objName of objectsList) {
        await this.minioClient.removeObject(this.bucketName, objName);
        console.log(`Object ${objName} removed`);
      }
    }
  }

  // WORKS WELL
  async moveFile(oldPath: string, newPath: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { path: oldPath } });
    if (!file) throw new NotFoundException('File not found');
    file.path = newPath;


    // find new folder entity
    // path of folder
    const newPathFolder = newPath.substring(0, newPath.lastIndexOf('/')+1);
    console.log('newPathFolder', newPathFolder)
    const folder = await this.folderRepository.findOne({ where: { path: newPathFolder } });
    if(!folder) throw new NotFoundException('Folder not found');
    file.folder = folder;
    await this.fileRepository.save(file);

    // Move the file in MinIO
    const conditions = new Minio.CopyConditions();
    await this.minioClient.copyObject(this.bucketName, newPath, `/${this.bucketName}/${oldPath}`, conditions);
    await this.minioClient.removeObject(this.bucketName, oldPath);
  }

  // WORKS WELL
  async recMoveFilesAndFolders(folder: Folder, oldPath: string, newPath: string): Promise<void> {
    const bestFolder = await this.folderRepository.findOne({ where: { id:folder.id }, relations: ['childrenFolders', 'files'] });
    if(!bestFolder) return;
    const childrenFolders = bestFolder.childrenFolders;
    const files: File[] = bestFolder.files;
    if(!childrenFolders && !files) return;

    for(const file of files) {
      await this.moveFile(file.path, file.path.replace(oldPath, newPath));
    }

    for(const childFolder of childrenFolders) {
      childFolder.path = childFolder.path.replace(oldPath, newPath);
      await this.folderRepository.save(childFolder);
      await this.recMoveFilesAndFolders(childFolder, oldPath, newPath);
    }
  }

  // WORKS WELL
  async moveFolder(oldPath: string, newPath: string): Promise<void> {
    const folder = await this.folderRepository.findOne({ where: { path: oldPath } });
    if (!folder) throw new NotFoundException('Folder not found');
    folder.path = newPath;
    await this.folderRepository.save(folder);
    // update all files path
    // get all children folders and children files, and update path, in recursive way

    await this.recMoveFilesAndFolders(folder, oldPath, newPath);
  }

  async renameFile(path: string, newName: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { path } });
    if (!file) throw new NotFoundException('File not found');
    const newPath = path.replace(file.name, newName);
    file.path = newPath;
    file.name = newName;
    await this.fileRepository.save(file);

    // Rename the file in MinIO
    const conditions = new Minio.CopyConditions();
    await this.minioClient.copyObject(this.bucketName, newPath, `/${this.bucketName}/${path}`, conditions);
    await this.minioClient.removeObject(this.bucketName, path);
  }

  async renameFolder(path: string, newName: string): Promise<void> {
    const folder = await this.folderRepository.findOne({ where: { path } });
    if (!folder) throw new NotFoundException('Folder not found');
    const newPath = path.replace(folder.name, newName);
    folder.path = newPath;
    folder.name = newName;
    await this.folderRepository.save(folder);

    // Rename all files and subfolders in MinIO
    const objectsList = await this.minioClient.listObjects(this.bucketName, path, true);
    const conditions = new Minio.CopyConditions();
    for await (const obj of objectsList) {
      const newObjName = obj.name.replace(path, newPath);
      await this.minioClient.copyObject(this.bucketName, newObjName, `/${this.bucketName}/${obj.name}`, conditions);
      await this.minioClient.removeObject(this.bucketName, obj.name);
    }
  }

  // FIXME: vérifier avec les vraies permissions voulues sur l'architecture de départ
  async addPermissionToPath(path: string, userId: number, roleId: string, access: Access): Promise<Permission> {
    const user = await this.userRepository.findOneBy({id:userId});
    const role = await this.roleRepository.findOneBy({ name:roleId });
    if (!user || !role) throw new NotFoundException('User or role not found');

    let file = await this.fileRepository.findOne({ where: { path } });
    let folder = await this.folderRepository.findOne({ where: { path } });

    if (!file && !folder) throw new NotFoundException('Path does not exist');

    const permission = new Permission();
    permission.user = user;
    permission.role = role;
    permission.access = access;
    if (file) {
      permission.file = file;
    } else if (folder) {
      permission.folder = folder;
    }

    return this.permissionRepository.save(permission);
  }

  // WORKS WELL
  async downloadFile(path: string): Promise<Buffer> {
    const fileStream = await this.minioClient.getObject(this.bucketName, path);
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  // FIXME: does not seems to work
  async downloadFolder(path: string): Promise<Buffer> {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const objectsList = await this.minioClient.listObjects(this.bucketName, path, true);

    for await (const obj of objectsList) {
      const fileStream = await this.minioClient.getObject(this.bucketName, obj.name);
      archive.append(fileStream, { name: obj.name.replace(path, '') });
    }

    archive.finalize();
    return new Promise<Buffer>((resolve, reject) => {
      const writableStreamBuffer = new streamBuffers.WritableStreamBuffer();
      archive.pipe(writableStreamBuffer);

      writableStreamBuffer.on('finish', () => {
        resolve(writableStreamBuffer.getContents() as Buffer);
      });

      writableStreamBuffer.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  async listFolderContents(path: string): Promise<{ folders: Folder[], files: File[] }> {
    const folders = await this.folderRepository.find({ where: { path }, relations: ['childrenFolders', 'files'] });
    const files = await this.fileRepository.find({ where: { path } });

    return { folders, files };
  }

  async listSubFolders(path: string): Promise<Folder[]> {
    return this.folderRepository.find({ where: { path }, relations: ['childrenFolders'] });
  }

}
