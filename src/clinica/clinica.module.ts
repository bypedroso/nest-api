import { Module } from '@nestjs/common';
import { ClinicaService } from './clinica.service';
import { ClinicaController } from './clinica.controller';
@Module({
  providers: [ClinicaService],
  controllers: [ClinicaController],
  exports: [ClinicaService],
})
export class ClinicaModule {}
