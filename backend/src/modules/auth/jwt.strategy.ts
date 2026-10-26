import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'clave_secreta_compartida_con_intranet'),
    });
  }

  async validate(payload: any) {
    // El payload contiene los claims firmados por la Intranet Hospitalaria
    return {
      id: payload.sub || payload.id,
      documento: payload.documento || payload.cedula,
      nombre: payload.nombre || payload.nombres,
      rol: payload.rol || 'ASISTENCIAL',
      servicioId: payload.servicioId || payload.dependenciaId,
    };
  }
}
