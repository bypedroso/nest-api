import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Clinica } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';

export type UpdateProperties = Partial<
  Omit<Clinica, 'updated_at' | 'created_at'>
>;

@Injectable()
export class ClinicaService {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<Clinica> {
    const clinic = await this.prismaService.clinica.findUnique({
      where: {
        id,
      },
    });
    if (!clinic) {
      throw new BadRequestException('Clinic does not found');
    }

    return clinic;
  }

  async find(options: Prisma.ClinicaFindUniqueArgs): Promise<Clinica> {
    const clinic = await this.prismaService.clinica.findUnique(options);
    if (!clinic) {
      throw new BadRequestException('Clinica nao encontrada');
    }

    return clinic;
  }

  async updateClinic(
    id: string,
    properties: UpdateProperties,
  ): Promise<Clinica> {
    try {
      if (properties.cnpj) {
        const hasCNPJ = await this.prismaService.clinica.findFirst({
          where: {
            cnpj: properties.cnpj,
          },
        });
        if (hasCNPJ) throw new BadRequestException('CNPJ já está em uso!');
      }
      const updatedClinic = await this.prismaService.clinica.update({
        data: {
          ...properties,
        },
        where: {
          id,
        },
      });
      return updatedClinic;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Clinica não encontrada!');
        }
      } else if (error.message === 'CNPJ já está em uso!') {
        throw error;
      }

      throw new InternalServerErrorException(error);
    }
  }

  async updateMany(
    properties: Prisma.ClinicaUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    try {
      const updatedClinic = await this.prismaService.clinica.updateMany(
        properties,
      );
      return updatedClinic;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Clinic does not found');
        }
      }
      throw new InternalServerErrorException(error);
    }
  }
}
