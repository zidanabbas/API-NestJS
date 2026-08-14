import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../auth.cookie.js';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { UserRole } from '#app/generated/prisma/enums.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          (req?.cookies as Record<string, string>)?.[ACCESS_TOKEN_COOKIE] ??
          null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
