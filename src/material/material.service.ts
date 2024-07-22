import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { MaterialModel } from './materialmodel.entity';
import { CreateMaterialDto } from './dto/creatematerial.dto';
import { UpdateMaterialDto } from './dto/updatematerial.dto';
import { CreateMaterialModelDto } from './dto/creatematerialmodel.dto';
import { UpdateMaterialModelDto } from './dto/updatematerialmodel.dto';
import { Activity } from '../activity/activity.entity';
import { Local } from '../locals/local.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    @InjectRepository(MaterialModel)
    private materialModelRepository: Repository<MaterialModel>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Local)
    private localRepository: Repository<Local>,
  ) {}

  findAll(): Promise<Material[]> {
    return this.materialRepository.find({
      relations: ['materialModel', 'activities', 'local'],
    });
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { serialNumber: id },
      relations: ['materialModel', 'activities', 'local'],
    });
    if (!material) {
      throw new HttpException('Material not found', HttpStatus.NOT_FOUND);
    }
    return material;
  }

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    const materialModel = await this.materialModelRepository.findOne({
      where: { name: createMaterialDto.materialModelId },
    });
    if (!materialModel) {
      throw new HttpException('Material model not found', HttpStatus.NOT_FOUND);
    }

    const material = new Material();
    material.materialModel = materialModel;

    return this.materialRepository.save(material);
  }

  async update(
    id: string,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { serialNumber: id },
    });
    if (!material) {
      throw new HttpException('Material not found', HttpStatus.NOT_FOUND);
    }

    const local = await this.localRepository.findOne({
      where: { id: updateMaterialDto.local },
    });
    if (!local) {
      throw new HttpException('Local not found', HttpStatus.NOT_FOUND);
    }
    material.local = local;

    return this.materialRepository.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { serialNumber: id },
    });
    if (!material) {
      throw new HttpException('Material not found', HttpStatus.NOT_FOUND);
    }

    await this.materialRepository.remove(material);
  }

  findAllModels(): Promise<MaterialModel[]> {
    return this.materialModelRepository.find();
  }

  async findOneModel(name: string): Promise<MaterialModel> {
    const materialModel = await this.materialModelRepository.findOne({
      where: { name },
    });
    if (!materialModel) {
      throw new HttpException('Material model not found', HttpStatus.NOT_FOUND);
    }
    return materialModel;
  }

  async createMaterialModel(
    createMaterialModelDto: CreateMaterialModelDto,
  ): Promise<MaterialModel> {
    const materialModel = new MaterialModel();
    materialModel.name = createMaterialModelDto.name;
    materialModel.model = createMaterialModelDto.model;
    materialModel.image = createMaterialModelDto.image;

    return this.materialModelRepository.save(materialModel);
  }

  async updateMaterialModel(
    name: string,
    updateMaterialModelDto: UpdateMaterialModelDto,
  ): Promise<MaterialModel> {
    const materialModel = await this.materialModelRepository.findOne({
      where: { name },
    });
    if (!materialModel) {
      throw new HttpException('Material model not found', HttpStatus.NOT_FOUND);
    }

    materialModel.model = updateMaterialModelDto.model;
    materialModel.image = updateMaterialModelDto.image;

    return this.materialModelRepository.save(materialModel);
  }

  async removeMaterialModel(name: string): Promise<void> {
    const materialModel = await this.materialModelRepository.findOne({
      where: { name },
    });
    if (!materialModel) {
      throw new HttpException('Material model not found', HttpStatus.NOT_FOUND);
    }

    await this.materialModelRepository.remove(materialModel);
  }

  async assignMaterialToActivity(
    materialId: string,
    activityId: number,
  ): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { serialNumber: materialId },
      relations: ['activities'],
    });
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });

    if (!material || !activity) {
      throw new HttpException(
        'Material or Activity not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if material is available
    const overlappingActivities = await this.activityRepository
      .createQueryBuilder('activity')
      .innerJoin(
        'activity.materials',
        'material',
        'material.serialNumber = :materialId',
        { materialId },
      )
      .where(
        ':beginDateTime BETWEEN activity.beginDateTime AND activity.endDateTime',
        { beginDateTime: activity.beginDateTime },
      )
      .orWhere(
        ':endDateTime BETWEEN activity.beginDateTime AND activity.endDateTime',
        { endDateTime: activity.endDateTime },
      )
      .getMany();

    if (overlappingActivities.length > 0) {
      throw new HttpException(
        'Material is not available for the selected dates',
        HttpStatus.CONFLICT,
      );
    }

    material.activities.push(activity);
    await this.materialRepository.save(material);
  }

  async unassignMaterialFromActivity(
    materialId: string,
    activityId: number,
  ): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { serialNumber: materialId },
      relations: ['activities'],
    });
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });

    if (!material || !activity) {
      throw new HttpException(
        'Material or Activity not found',
        HttpStatus.NOT_FOUND,
      );
    }

    console.log('material activites before');
    material.activities = material.activities.filter(
      (act) => act.id !== activityId,
    );
    console.log('material activites after');
    await this.materialRepository.save(material);
  }

  async assignMaterialToLocal(
    materialId: string,
    localId: number,
  ): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { serialNumber: materialId },
      relations: ['local'],
    });
    const local = await this.localRepository.findOne({
      where: { id: localId },
    });

    if (!material || !local) {
      throw new HttpException(
        'Material or Local not found',
        HttpStatus.NOT_FOUND,
      );
    }

    material.local = local;
    await this.materialRepository.save(material);
  }
}
