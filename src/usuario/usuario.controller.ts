import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../common/decorators';
import { UsuarioService } from './usuario.service';
import { UpdateUserDto, ResponseUserDto } from './dto';

@ApiBearerAuth()
@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  @Put('')
  @HttpCode(HttpStatus.OK)
  async update(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    if (!dto.email && !dto.name) {
      return;
    }
    const user = await this.usuarioService.updateUser(userId, dto);
    const responseUser = {
      email: user.email,
      name: user.nome,
    };
    return responseUser;
  }

  @Get('whoami')
  @HttpCode(HttpStatus.OK)
  async getUser(@GetCurrentUserId() userId: string): Promise<ResponseUserDto> {
    const user = await this.usuarioService.findById(userId);
    const responseUser = {
      email: user.email,
      email_verified: user.email_verificado,
      name: user.nome,
    };
    return responseUser;
  }
}
