import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Usuario } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { CreateAccountDto } from 'src/auth/dto';

export type UpdateProperties = Partial<
  Omit<Usuario, 'updated_at' | 'created_at'>
>;

@Injectable()
export class UsuarioService {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<Usuario> {
    const user = await this.prismaService.usuario.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new BadRequestException('User does not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<Usuario | undefined> {
    const user = await this.prismaService.usuario.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async find(
    options: Prisma.UsuarioFindUniqueArgs,
    withPassword = false,
  ): Promise<Usuario> {
    const user = await this.prismaService.usuario.findUnique(options);
    if (!user) {
      throw new BadRequestException('User does not found');
    }
    if (!withPassword) {
      delete user.password;
    }
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<Usuario> {
    const password = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prismaService.usuario
      .create({
        data: {
          email: dto.email,
          password: password,
          nome: dto.name,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials incorrect');
          }
        }

        throw error;
      });

    return newUser;
  }

  async registerUser(dto: CreateAccountDto): Promise<Usuario> {
    const password = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prismaService.usuario
      .create({
        data: {
          email: dto.email,
          password: password,
          nome: dto.name,
          clinicas: {
            create: [
              {
                admin: true,
                clinica: {
                  create: {
                    cnpj: dto.clinica_cnpj,
                    nome: dto.clinica_name,
                  },
                },
              },
            ],
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials incorrect');
          }
        }

        throw error;
      });

    return newUser;
  }

  async updateUser(id: string, properties: UpdateProperties): Promise<Usuario> {
    try {
      if (properties.email) {
        const hasEmail = await this.prismaService.usuario.findFirst({
          where: {
            email: properties.email,
          },
        });
        if (hasEmail)
          throw new BadRequestException(
            'E-mail já está em uso por outro usuário!',
          );
      }
      const updatedUser = await this.prismaService.usuario.update({
        data: {
          ...properties,
        },
        where: {
          id,
        },
      });
      return updatedUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Usuário não encontrado!');
        }
      } else if (error.message === 'E-mail já está em uso por outro usuário!') {
        throw error;
      }

      throw new InternalServerErrorException(error);
    }
  }

  async updateMany(
    properties: Prisma.UsuarioUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    try {
      const updatedUser = await this.prismaService.usuario.updateMany(
        properties,
      );
      return updatedUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('User does not found');
        }
      }
      throw new InternalServerErrorException(error);
    }
  }
}
