import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { UsuarioService } from '../usuario/usuario.service';
import { PrismaService } from '../prisma/prisma.service';

import { AuthDto } from './dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { Auth, JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private usuarioService: UsuarioService,
    private mailService: MailService,
  ) {}

  async signupLocal(dto: CreateAccountDto): Promise<Auth> {
    try {
      const userEmail = await this.usuarioService.findByEmail(dto.email);

      if (userEmail) {
        throw new BadRequestException('E-mail já está em uso!');
      }

      const user = await this.usuarioService.createUser(dto);

      const tokens = await this.getTokens(user.id, user.email);

      await this.updateRtHash(user.id, tokens.refresh_token);

      this.sendEmailVerificationMail(user);

      return {
        ...tokens,
        user: {
          name: user.nome,
          email: user.email,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException &&
        error.message === 'E-mail já está em uso!'
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async register(dto: CreateAccountDto): Promise<Auth> {
    try {
      const userEmail = await this.usuarioService.findByEmail(dto.email);

      if (userEmail) {
        throw new BadRequestException('E-mail já está em uso!');
      }

      const user = await this.usuarioService.registerUser(dto);

      const tokens = await this.getTokens(user.id, user.email);

      await this.updateRtHash(user.id, tokens.refresh_token);

      this.sendEmailVerificationMail(user);

      return {
        ...tokens,
        user: {
          name: user.nome,
          email: user.email,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException &&
        error.message === 'E-mail já está em uso!'
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async signinLocal(dto: AuthDto): Promise<Auth> {
    let user: Usuario;
    try {
      user = await this.usuarioService.find(
        {
          where: {
            email: dto.email,
          },
        },
        true,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new ForbiddenException(
          'Acesso negado, verifique seu usuário ou senha!',
        );
      }
      throw new InternalServerErrorException(error);
    }

    if (!user.email_verificado)
      throw new ForbiddenException(
        'Acesso negado, valide seu cadastro por e-mail!',
      );

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches)
      throw new ForbiddenException(
        'Acesso negado, verifique seu usuário ou senha!',
      );

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        name: user.nome,
        email: user.email,
      },
    };
  }

  async logout(userId: string): Promise<boolean> {
    await this.usuarioService.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return true;
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    let user: Usuario;

    try {
      user = await this.usuarioService.findById(userId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new ForbiddenException('Access Denied');
      }
      throw new InternalServerErrorException(error);
    }

    if (!user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);

    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: string, rt: string): Promise<void> {
    const hash = await bcrypt.hash(rt, 10);

    await this.usuarioService.updateUser(userId, { hashedRt: hash });
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: this.config.get<string>('AT_JWT_EXPIRE_IN'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: this.config.get<string>('RT_JWT_EXPIRE_IN'),
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  private sendEmailVerificationMail(user: Usuario): void {
    const token = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('EMAIL_JWT_EXPIRE_IN'),
      },
    );

    const url = `${process.env.FRONTEND_URL}/auth/email/verify/${token}`;

    this.mailService.sendUserConfirmation(user, 'Easyvet', url);
  }

  async resendVerifyEmail(userId: string): Promise<void> {
    let user: Usuario;

    try {
      user = await this.usuarioService.findById(userId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new ForbiddenException('Access Denied');
      }
      throw new InternalServerErrorException(error);
    }
    this.sendEmailVerificationMail(user);
  }

  async verifyEmail(token: string): Promise<Usuario> {
    let userFromTokenPayload: Usuario;

    try {
      userFromTokenPayload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
    await this.usuarioService.findById(userFromTokenPayload.id);

    const updatedUser = await this.usuarioService.updateUser(
      userFromTokenPayload.id,
      {
        email_verificado: true,
      },
    );

    return updatedUser;
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.usuarioService.findById(id);

    const isOldPasswordCorrect: boolean = await bcrypt.compare(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordCorrect) {
      throw new UnauthorizedException('Old password is not correct');
    }

    const password = await bcrypt.hash(newPassword, 10);

    return await this.usuarioService.updateUser(user.id, {
      password,
    });
  }

  async sendForgotPasswordLink(email: string) {
    try {
      await this.usuarioService.find({ where: { email } });
    } catch (error) {
      if (error instanceof BadRequestException) {
        return;
      }
    }
    try {
      const token = await this.jwtService.sign(
        { email },
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: this.config.get<string>('EMAIL_JWT_EXPIRE_IN'),
        },
      );

      await this.prisma.esqueceuSenha.upsert({
        where: {
          email,
        },
        create: {
          email,
          token,
        },
        update: {
          email,
          token,
        },
      });

      // Send email with the reset password link.
      const url = `${process.env.FRONTEND_URL}/auth/password/reset/${token}`;

      await this.mailService.sendResetPasswordLink(email, url);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<Usuario> {
    const forgotToken = await this.prisma.esqueceuSenha.findFirst({
      where: {
        token,
      },
    });
    if (!forgotToken) {
      throw new BadRequestException('Invalid token');
    }

    let emailFromToken: any;
    try {
      emailFromToken = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }

    if (emailFromToken.email !== forgotToken.email) {
      throw new BadRequestException('Invalid token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await this.usuarioService.find({
      where: { email: forgotToken.email },
    });

    const updatedUser = await this.usuarioService.updateUser(user.id, {
      password: hashedPassword,
    });

    return updatedUser;
  }
}
