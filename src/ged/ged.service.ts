import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './folder.entity';
import { File } from './file.entity';
import * as Minio from 'minio';
import { User } from '../user/user.entity';
import { Role } from '../roles/role.entity';
import { Access, Permission } from './permission.entity';
import * as archiver from 'archiver';
import { WritableStreamBuffer } from 'stream-buffers';

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
    private readonly permissionRepository: Repository<Permission>,
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
    const parentFolder = await this.folderRepository.findOne({
      where: { path },
    });
    if (!parentFolder) throw new NotFoundException('Parent folder not found');
    const folder = new Folder();
    folder.name = name;
    folder.path = path === '/' ? `/${name}/` : `${path}${name}/`;
    folder.parentFolder = parentFolder;
    return this.folderRepository.save(folder);
  }

  // WORKS WELL
  async addFile(
    path: string,
    name: string,
    fileContent: Buffer,
  ): Promise<File> {
    const folder = await this.folderRepository.findOne({ where: { path } });
    if (!folder) throw new NotFoundException('Folder not found');
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
    await this.fileRepository
      .createQueryBuilder()
      .delete()
      .from(File)
      .where('path like :path', { path: `${path}%` })
      .execute();
    console.log('Files removed');

    // Remove subfolders of targeted folder in the database first using query builder
    await this.folderRepository
      .createQueryBuilder()
      .delete()
      .from(Folder)
      .where('path like :path', { path: `${path}%` })
      .execute();
    console.log('Subfolders removed');

    // Remove targeted folder
    await this.folderRepository.remove(folder);
    console.log('Targeted folder removed');

    // remove first / from path
    const minioPathWithoutFirstSlash = path.substring(1);

    // Remove all files and subfolders from MinIO
    const objectsStream = this.minioClient.listObjectsV2(
      this.bucketName,
      minioPathWithoutFirstSlash,
      true,
    );
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
    const file = await this.fileRepository.findOne({
      where: { path: oldPath },
    });
    if (!file) throw new NotFoundException('File not found');
    file.path = newPath;

    // find new folder entity
    // path of folder
    const newPathFolder = newPath.substring(0, newPath.lastIndexOf('/') + 1);
    console.log('newPathFolder', newPathFolder);
    const folder = await this.folderRepository.findOne({
      where: { path: newPathFolder },
    });
    if (!folder) throw new NotFoundException('Folder not found');
    file.folder = folder;
    await this.fileRepository.save(file);

    // Move the file in MinIO
    const conditions = new Minio.CopyConditions();
    await this.minioClient.copyObject(
      this.bucketName,
      newPath,
      `/${this.bucketName}/${oldPath}`,
      conditions,
    );
    await this.minioClient.removeObject(this.bucketName, oldPath);
  }

  // WORKS WELL
  async recMoveFilesAndFolders(
    folder: Folder,
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const bestFolder = await this.folderRepository.findOne({
      where: { id: folder.id },
      relations: ['childrenFolders', 'files'],
    });
    if (!bestFolder) return;
    const childrenFolders = bestFolder.childrenFolders;
    const files: File[] = bestFolder.files;
    if (!childrenFolders && !files) return;

    for (const file of files) {
      await this.moveFile(file.path, file.path.replace(oldPath, newPath));
    }

    for (const childFolder of childrenFolders) {
      childFolder.path = childFolder.path.replace(oldPath, newPath);
      await this.folderRepository.save(childFolder);
      await this.recMoveFilesAndFolders(childFolder, oldPath, newPath);
    }
  }

  // WORKS WELL
  async moveFolder(oldPath: string, newPath: string): Promise<void> {
    if (oldPath === newPath)
      throw new ConflictException('Old path and new path are the same');
    const folder = await this.folderRepository.findOne({
      where: { path: oldPath },
    });
    if (!folder) throw new NotFoundException('Folder not found');
    folder.path = newPath;
    folder.name = newPath.split('/').slice(-2)[0];

    // newPath is for example /a/b/c/ and we want to get /a/b/
    const newParentPath = newPath.substring(
      0,
      newPath.lastIndexOf('/', newPath.length - 2) + 1,
    );
    const newParentFolder = await this.folderRepository.findOne({
      where: { path: newParentPath },
    });
    if (!newParentFolder)
      throw new NotFoundException('New parent folder not found');
    folder.parentFolder = newParentFolder;
    await this.folderRepository.save(folder);
    // update all files path
    // get all children folders and children files, and update path, in recursive way

    await this.recMoveFilesAndFolders(folder, oldPath, newPath);
  }

  async renameFile(path: string, newName: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { path } });
    if (!file) throw new NotFoundException('File not found');

    // check if newName is equals to the last file name
    if (file.name === newName)
      throw new ConflictException('New name is the same as the old one');
    const newPath = path.replace(file.name, newName);
    file.path = newPath;
    file.name = newName;
    await this.fileRepository.save(file);

    // Rename the file in MinIO
    const conditions = new Minio.CopyConditions();
    await this.minioClient.copyObject(
      this.bucketName,
      newPath,
      `/${this.bucketName}/${path}`,
      conditions,
    );
    await this.minioClient.removeObject(this.bucketName, path);
  }

  async renameFolder(path: string, newName: string): Promise<void> {
    // check if newName is equals to the last folder name
    const folder = await this.folderRepository.findOne({
      where: { path },
      relations: ['parentFolder'],
    });
    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.name === newName)
      throw new ConflictException('New name is the same as the old one');

    const parentDir = folder.parentFolder.path;
    const newPath = `${parentDir}${newName}/`;
    await this.moveFolder(path, newPath);
  }

  // FIXME: vérifier avec les vraies permissions voulues sur l'architecture de départ
  async addPermissionToPath(
    path: string,
    userId: number,
    roleId: string,
    access: Access,
  ): Promise<Permission> {
    const user = await this.userRepository.findOneBy({ id: userId });
    const role = await this.roleRepository.findOneBy({ name: roleId });
    if (!user || !role) throw new NotFoundException('User or role not found');
    console.log('user : ', user);
    console.log('role : ', role);

    const file = await this.fileRepository.findOne({ where: { path } });
    const folder = await this.folderRepository.findOne({ where: { path } });

    if (!file && !folder) throw new NotFoundException('Path does not exist');

    const permission = new Permission();
    if (userId) permission.user = user;
    if (roleId) permission.role = role;
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
    const writableStreamBuffer = new WritableStreamBuffer();
    archive.pipe(writableStreamBuffer);

    const objectsList = this.minioClient.listObjectsV2(
      this.bucketName,
      path,
      true,
    );

    for await (const obj of objectsList) {
      if (obj.name.endsWith('/')) continue; // Skip directories
      const fileStream = await this.minioClient.getObject(
        this.bucketName,
        obj.name,
      );
      archive.append(fileStream, { name: obj.name.replace(path, '') });
    }

    await archive.finalize();

    return new Promise<Buffer>((resolve, reject) => {
      writableStreamBuffer.on('finish', () => {
        resolve(writableStreamBuffer.getContents() as Buffer);
      });

      writableStreamBuffer.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  async getRights(user: User, path: string): Promise<Access> {
    // si l'user est admin, il a tous les droits
    if (user.roles.find((role) => role.name === 'admin')) {
      console.log('user is admin, returning MANAGE');
      return Access.MANAGE;
    }
    console.log('checking rights for path : ', path);
    console.log('user : ', user.email);
    const file = await this.fileRepository.findOne({
      where: { path },
      relations: ['folder'],
    });
    const folder = await this.folderRepository.findOne({
      where: { path },
      relations: ['parentFolder'],
    });

    if (!file && !folder) throw new NotFoundException('Path does not exist');
    if (file) console.log('file checked : ', file.name);
    if (folder) console.log('folder checked : ', folder.path);

    // find all permissions of user and user.roles, and check if there is a permission for the file or folder, if not, check if there is a permission for the parent folder
    const userPermissions = await this.permissionRepository.find({
      where: { user },
      relations: ['file', 'folder'],
    });

    const userRoles = user.roles;
    let rolePermissions: Permission[] = [];
    if (userRoles) {
      for (let i = 0; i < userRoles.length; i++) {
        const permissions = await this.permissionRepository.find({
          where: { role: userRoles[i] },
          relations: ['file', 'folder'],
        });
        rolePermissions = rolePermissions.concat(permissions);
      }
    }

    const allPermissions = userPermissions.concat(rolePermissions);
    // check if there is a permission for the file or folder
    let permission;
    if (file) {
      permission = allPermissions.find(
        (p) => p.file && p.file.path === file.path,
      );
    }
    if (folder) {
      permission = allPermissions.find(
        (p) => p.folder && p.folder.path === folder.path,
      );
    }
    if (permission) {
      console.log('permission found : ', permission.access);
      return permission.access;
    }
    // check if we are at the root
    if (path === '/') {
      console.log('path is /, returning NONE');
      return Access.NONE;
    }
    // check if there is a permission for the parent folder
    let parentFolderPath: string = '';
    if (file) {
      console.log('file.folder.path : ', file.folder.path);
      parentFolderPath = file.folder.path;
    }
    if (folder) {
      console.log('folder.parentFolder.path : ', folder.parentFolder.path);
      parentFolderPath = folder.parentFolder.path;
    }
    return await this.getRights(user, parentFolderPath);
  }

  async listFolderContents(
    userId: number,
    path: string,
  ): Promise<{ folders: (Folder | null)[]; files: (File | null)[] }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    const folder = await this.folderRepository.findOne({
      where: { path },
      relations: ['childrenFolders', 'files'],
    });
    if (!folder) throw new NotFoundException('Folder not found');

    const folders = folder.childrenFolders;
    // Check if user can read each folder
    const foldersFiltered = await Promise.all(
      folders.map(async (folder) => {
        const access = await this.getRights(user, folder.path);
        console.log('checking access for folder', folder.path, access);
        console.log('read access : ', Access.READ);
        console.log('access : ', access);
        console.log('access >= Access.READ : ', access >= Access.READ);
        return access >= Access.READ ? folder : null;
      }),
    ).then((folders) => folders.filter((folder) => folder !== null));
    console.log('folders after filter : ', foldersFiltered);

    const files = folder.files;
    console.log('files before filter : ', files);

    // Check if user can read each file
    const filesFiltered = await Promise.all(
      files.map(async (file) => {
        const access = await this.getRights(user, file.path);
        console.log('checking access for file', file.path, access);
        console.log('read access : ', Access.READ);
        console.log('access : ', access);
        console.log('access >= Access.READ : ', access >= Access.READ);
        return access >= Access.READ ? file : null;
      }),
    ).then((files) => files.filter((file) => file !== null));
    console.log('files after filter : ', filesFiltered);

    return { folders: foldersFiltered, files: filesFiltered };
  }

  async listSubFolders(userId: number, path: string): Promise<Folder[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    const folder = await this.folderRepository.findOne({ where: { path } });
    if (!folder) throw new NotFoundException('Folder not found');

    const childrenFolders = await this.folderRepository.find({
      where: { path },
      relations: ['childrenFolders'],
    });

    // Check if user can read each folder
    return childrenFolders.filter(async (childFolder) => {
      const access = await this.getRights(user, childFolder.path);
      return access >= Access.READ;
    });
  }

  async fileExists(path: string) {
    const file = await this.fileRepository.findOne({ where: { path } });
    return file !== null;
  }
}
