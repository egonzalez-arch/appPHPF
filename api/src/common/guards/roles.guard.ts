import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    const userRoles: string[] = Array.isArray(user.roles)
      ? user.roles
      : user.role
      ? [user.role]
      : [];

    const normalizedUserRoles = userRoles.map(r => r.toLowerCase());

    return requiredRoles.some(r => normalizedUserRoles.includes(r.toLowerCase()));
  }
}