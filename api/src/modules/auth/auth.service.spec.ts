import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AuthService (Autenticação e Segurança)', () => {
  let db: DatabaseService;
  let authService: AuthService;

  beforeEach(() => {
    db = DatabaseService.createInMemory();
    authService = new AuthService(db);
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-AUTH-001: deve cadastrar novo usuário com senha hasheada e retornar token JWT', async () => {
    const res = await authService.register({
      name: 'João Silva',
      email: 'joao.silva@exemplo.com',
      password: 'SenhaForte123',
    });

    expect(res).toBeDefined();
    expect(res.user.id).toBeDefined();
    expect(res.user.email).toBe('joao.silva@exemplo.com');
    expect(res.user.name).toBe('João Silva');
    expect(res.token).toBeDefined();

    // Verifica se a senha gravada no banco NÃO é texto puro
    const userInDb = db.queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = ?',
      [res.user.id]
    );
    expect(userInDb?.password_hash).not.toBe('SenhaForte123');
    expect(userInDb?.password_hash.startsWith('$2')).toBe(true);

    // Verifica se o perfil inicial foi criado na tabela profiles
    const profile = db.queryOne('SELECT * FROM profiles WHERE user_id = ?', [res.user.id]);
    expect(profile).toBeDefined();
  });

  it('TEST-AUTH-002: deve rejeitar cadastro com e-mail duplicado (RN01)', async () => {
    await authService.register({
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      password: 'SenhaForte123',
    });

    await expect(
      authService.register({
        name: 'Maria Outra',
        email: 'MARIA@EXEMPLO.COM', // Maiúsculo para testar case-insensitivity
        password: 'OutraSenha456',
      })
    ).rejects.toThrow(ConflictException);
  });

  it('TEST-AUTH-003: deve realizar login com sucesso com credenciais válidas', async () => {
    await authService.register({
      name: 'Carlos Oliveira',
      email: 'carlos@exemplo.com',
      password: 'SenhaForte123',
    });

    const loginRes = await authService.login({
      email: 'carlos@exemplo.com',
      password: 'SenhaForte123',
    });

    expect(loginRes.token).toBeDefined();
    expect(loginRes.user.email).toBe('carlos@exemplo.com');
  });

  it('TEST-AUTH-004: deve rejeitar login com senha incorreta ou usuário inexistente', async () => {
    await authService.register({
      name: 'Carlos Oliveira',
      email: 'carlos2@exemplo.com',
      password: 'SenhaForte123',
    });

    // Senha errada
    await expect(
      authService.login({
        email: 'carlos2@exemplo.com',
        password: 'SenhaErrada999',
      })
    ).rejects.toThrow(UnauthorizedException);

    // E-mail inexistente
    await expect(
      authService.login({
        email: 'naoexiste@exemplo.com',
        password: 'SenhaForte123',
      })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('TEST-SEC-001: deve validar token JWT emitido e rejeitar token falso/adulterado', async () => {
    const reg = await authService.register({
      name: 'Ana Paula',
      email: 'ana@exemplo.com',
      password: 'SenhaForte123',
    });

    const decoded = authService.verifyToken(reg.token);
    expect(decoded.sub).toBe(reg.user.id);
    expect(decoded.email).toBe('ana@exemplo.com');

    // Token adulterado
    expect(() => authService.verifyToken('token-falso-adulterado')).toThrow(UnauthorizedException);
  });

  it('TEST-AUTH-005: deve recuperar os dados do próprio usuário com getMe', async () => {
    const reg = await authService.register({
      name: 'Roberto Dias',
      email: 'roberto@exemplo.com',
      password: 'SenhaForte123',
    });

    const me = await authService.getMe(reg.user.id);
    expect(me.id).toBe(reg.user.id);
    expect(me.name).toBe('Roberto Dias');

    await expect(authService.getMe('user-inexistente')).rejects.toThrow(NotFoundException);
  });
});
