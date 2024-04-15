import { Body, Controller, Get, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { ScopeService } from "./scope.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Scope } from "./scope.entity";
import { Response } from "express";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags('scopes')
@Controller('scopes')
export class ScopeController {
  constructor(private scopeService: ScopeService) {
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Return all scopes',
    schema: {
      example: [
        {
          name: 'roles:create',
          description: 'Create roles'
        },
        {
          name: 'roles:delete',
          description: 'Delete roles'
        }
      ]
    }
  })
  @ApiResponse({
    status: 204,
    description: 'No scopes found'
  })
  async getAllScopes(@Res() res: Response) {
    // if no scopes are found, this will return an empty array and a 204 status code
    const scopes = await this.scopeService.getAllScopes()

    if (scopes.length === 0) {
      // Si la liste est vide, on envoie un code 204 (No Content)
      res.status(204).send();
    } else {
      // Sinon, on envoie un code 200 avec les éléments
      res.status(200).json(scopes);
    }
  }
}
