import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Clinic, UsersOnClinics } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';

export type UpdateProperties = Partial<
  Omit<Clinic, 'updated_at' | 'created_at'>
>;

@Injectable()
export class ClinicService {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<Clinic> {
    const clinic = await this.prismaService.clinic.findUnique({
      where: {
        id,
      },
    });
    if (!clinic) {
      throw new BadRequestException('Clinic does not found');
    }

    return clinic;
  }

  async find(options: Prisma.ClinicFindUniqueArgs): Promise<Clinic> {
    const clinic = await this.prismaService.clinic.findUnique(options);
    if (!clinic) {
      throw new BadRequestException('Clinic does not found');
    }

    return clinic;
  }

  async createClinicOnSignup(
    cnpj: string,
    name: string,
    responsible_user_id: string,
  ): Promise<Clinic> {
    const newClinic = await this.prismaService.clinic
      .create({
        data: {
          cnpj: cnpj,
          name: name,
          responsible_user_id: responsible_user_id,
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

    return newClinic;
  }

  async updateClinic(
    id: string,
    properties: UpdateProperties,
  ): Promise<Clinic> {
    try {
      if (properties.cnpj) {
        const hasCNPJ = await this.prismaService.clinic.findFirst({
          where: {
            cnpj: properties.cnpj,
          },
        });
        if (hasCNPJ) throw new BadRequestException('CNPJ já está em uso!');
      }
      const updatedClinic = await this.prismaService.clinic.update({
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
    properties: Prisma.ClinicUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    try {
      const updatedClinic = await this.prismaService.clinic.updateMany(
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
