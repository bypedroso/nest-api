import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './common/guards';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';
import { MailModule } from './mail/mail.module';
import { UsuarioModule } from './usuario/usuario.module';
import { BlockListModule } from './blocklist/blocklist.module';
import { ClinicaModule } from './clinica/clinica.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    LoggerModule,
    MailModule,
    UsuarioModule,
    BlockListModule,
    ClinicaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
