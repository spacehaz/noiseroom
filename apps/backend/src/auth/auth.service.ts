import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private repository: AuthRepository,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.repository.findByUsername(dto.username);
    if (existing) throw new ConflictException('Username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.repository.createUser(dto.username, passwordHash);

    return { access_token: this.sign(user.id, user.username) };
  }

  async login(dto: LoginDto) {
    const user = await this.repository.findByUsername(dto.username);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return { access_token: this.sign(user.id, user.username) };
  }

  private sign(userId: string, username: string) {
    return this.jwt.sign({ userId, username });
  }
}
