import { Module } from '@nestjs/common';
import { ScopeService } from './scope.service';
import { ScopeController } from './scope.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scope } from './scope.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scope])],
  providers: [ScopeService],
  controllers: [ScopeController],
  exports: [ScopeService],
})
export class ScopeModule {}
