import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    console.log(`[DEBUG] JWT Strategy - payload:`, JSON.stringify(payload, null, 2));
    
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['profile'],
    });

    console.log(`[DEBUG] JWT Strategy - found user:`, user ? `${user.id} (${user.email})` : 'null');

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // Ensure user has sub property for consistency
    (user as any).sub = user.id;
    
    return user;
  }
}