import { Module } from '@nestjs/common';
import { JavaAppService } from "./javaApp.service";
import { JavaAppController } from "./javaApp.controller";
import { MulterModule } from "@nestjs/platform-express";
import * as process from "process";
import { join } from "path";

@Module({
  imports: [
    MulterModule.register({
      dest: process.env.JARS_DIRECTORY || join(__dirname, '..', '..', 'jars')
    }),
  ],
  providers: [JavaAppService],
  controllers: [JavaAppController],
})
export class JavaAppModule {}
