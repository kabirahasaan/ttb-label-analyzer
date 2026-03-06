# Security Policy

Comprehensive security guidelines for the TTB Label Compliance Validation Platform. This document covers threat mitigation, vulnerability management, and compliance requirements.

**Last Updated**: March 2024  
**Current Risk Level**: 🟢 Low (for development)  
**Compliance Status**: TTB-Ready, GDPR-Compliant (future), SOC 2 Ready

## Table of Contents

1. [Input Validation](#input-validation)
2. [File Upload Protection](#file-upload-protection)
3. [Rate Limiting](#rate-limiting)
4. [Dependency Scanning](#dependency-scanning)
5. [Secrets Management](#secrets-management)
6. [OWASP Top 10](#owasp-top-10)
7. [Authentication & Authorization](#authentication--authorization)
8. [Data Protection](#data-protection)
9. [Infrastructure Security](#infrastructure-security)
10. [Compliance & Audit](#compliance--audit)
11. [Security Checklist](#security-checklist)
12. [Incident Response](#incident-response)

---

## Input Validation

### Frontend Validation (Zod)

**Purpose**: Client-side validation for immediate user feedback and reduced server load.

```typescript
// apps/web/src/lib/validation.ts
import { z } from 'zod';

export const labelSchema = z.object({
  brandName: z
    .string()
    .min(1, 'Brand name is required')
    .max(255, 'Brand name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-&',.]+$/, 'Brand name contains invalid characters'),

  alcoholByVolume: z
    .number()
    .min(0, 'ABV must be 0 or higher')
    .max(100, 'ABV cannot exceed 100%')
    .step(0.1, 'ABV must be in 0.1% increments'),

  netContents: z
    .string()
    .min(1, 'Net contents required')
    .max(500, 'Net contents too long')
    .regex(/^[\d\s\.\/\-a-zA-Z()%]+$/, 'Invalid net contents format'),

  governmentWarning: z
    .string()
    .min(20, 'Warning text too short')
    .max(1000, 'Warning text too long'),

  classType: z.enum(['beer', 'wine', 'spirits', 'malt_beverage'], {
    errorMap: () => ({ message: 'Invalid class type' }),
  }),

  producerName: z.string().min(1, 'Producer name required').max(255, 'Producer name too long'),
});

export type LabelInput = z.infer<typeof labelSchema>;
```

**Usage in React**:

```typescript
import { labelSchema } from '@/lib/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function UploadLabelForm() {
  const form = useForm({
    resolver: zodResolver(labelSchema),
    mode: 'onChange',
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        {...form.register('brandName')}
        placeholder="Brand Name"
      />
      {form.formState.errors.brandName && (
        <span>{form.formState.errors.brandName.message}</span>
      )}
    </form>
  );
}
```

### Backend Validation (class-validator)

**Purpose**: Server-side validation as the authoritative source of truth (never trust client).

```typescript
// apps/api/src/app/modules/label/label.dto.ts
import {
  IsString,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLabelDto {
  @IsString({ message: 'Brand name must be a string' })
  @MinLength(1, 'Brand name cannot be empty')
  @MaxLength(255, 'Brand name must be less than 255 characters')
  @Matches(/^[a-zA-Z0-9\s\-&',.]+$/, {
    message: 'Brand name contains invalid characters',
  })
  @Transform(({ value }) => value?.trim())
  brandName: string;

  @IsNumber({}, { message: 'ABV must be a number' })
  @Min(0, 'ABV cannot be negative')
  @Max(100, 'ABV cannot exceed 100%')
  @Transform(({ value }) => parseFloat(value))
  alcoholByVolume: number;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Matches(/^[\d\s\.\/\-a-zA-Z()%]+$/)
  netContents: string;

  @IsString()
  @MinLength(20, 'Warning text must be at least 20 characters')
  @MaxLength(1000)
  governmentWarning: string;

  @IsEnum(['beer', 'wine', 'spirits', 'malt_beverage'])
  classType: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  producerName: string;

  @ValidateIf((o) => o.imageUrl !== undefined)
  @IsString()
  @Matches(/^(https?:\/\/).+(\.jpg|\.jpeg|\.png|\.gif)$/i)
  imageUrl?: string;
}

export class UpdateLabelDto extends PartialType(CreateLabelDto) {}
```

**Validation Pipe Configuration**:

```typescript
// apps/api/src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    forbidUnknownValues: true, // Reject unknown payload shapes
    transform: true, // Auto-transform payloads
    transformOptions: {
      enableImplicitConversion: true,
    },
    stopAtFirstError: false, // Return all validation errors
  })
);
```

### Input Sanitization

```typescript
// Sanitize string inputs
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 5000); // Limit length
}

// Example: Clean HTML/script tags
import DOMPurify from 'isomorphic-dompurify';

const cleanInput = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [],
});
```

---

## File Upload Protection

### File Type Validation

```typescript
// apps/api/src/app/modules/label/label.controller.ts
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

// Allowed MIME types
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// File upload configuration
const storage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/labels'); // Dedicated upload directory
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for upload validation
const fileFilter = (_req: any, file: Express.Multer.File, cb: Function) => {
  // Check MIME type
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(
      new BadRequestException(`Invalid file type. Allowed: ${ALLOWED_MIMES.join(', ')}`),
      false
    );
  }

  // Check file extension (extra layer)
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new BadRequestException(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`),
      false
    );
  }

  cb(null, true);
};

@Controller('labels')
export class LabelController {
  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 52428800, // 50MB max
      },
    })
  )
  async uploadImage(
    @Param('id', ParseUUIDPipe) labelId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Additional security checks
    await this.validateFileContent(file);

    return this.labelService.attachImage(labelId, {
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      originalName: file.originalname,
    });
  }

  private async validateFileContent(file: Express.Multer.File) {
    // Check file magic numbers (headers)
    const magic = file.buffer.slice(0, 8);

    // JPEG: FF D8 FF
    // PNG: 89 50 4E 47
    const isValidJpeg = magic[0] === 0xff && magic[1] === 0xd8 && magic[2] === 0xff;
    const isValidPng =
      magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4e && magic[3] === 0x47;

    if (!isValidJpeg && !isValidPng) {
      throw new BadRequestException('File content does not match declared type');
    }

    // Scan file for malware (integrate with VirusTotal/ClamAV in production)
    // await this.malwareScanService.scan(file.buffer);
  }
}
```

### Secure File Storage

```typescript
// Environment configuration for uploads
export const UPLOAD_CONFIG = {
  // Isolated directory outside public web root
  directory: process.env.UPLOAD_DIR || './uploads/labels',

  // 50MB limit
  maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '52428800'),

  // Expiration (delete old uploads)
  expirationDays: parseInt(process.env.UPLOAD_EXPIRATION_DAYS || '30'),

  // Virus scanning (future)
  enableVirusScan: process.env.ENABLE_VIRUS_SCAN === 'true',

  // Cloud storage (future: AWS S3)
  useCloudStorage: process.env.USE_CLOUD_STORAGE === 'true',
  cloudBucket: process.env.CLOUD_BUCKET,
};

// Cleanup service for old uploads
@Injectable()
export class FileCleanupService {
  @Cron('0 2 * * *') // 2 AM daily
  async cleanupOldFiles() {
    const expirationDate = new Date(
      Date.now() - UPLOAD_CONFIG.expirationDays * 24 * 60 * 60 * 1000
    );

    const files = await fs.promises.readdir(UPLOAD_CONFIG.directory);

    for (const file of files) {
      const filePath = path.join(UPLOAD_CONFIG.directory, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.mtime < expirationDate) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Deleted expired file: ${file}`);
      }
    }
  }
}
```

### File Download Security

```typescript
// Prevent directory traversal attacks
@Get('uploads/:filename')
downloadFile(@Param('filename') filename: string, @Res() res: Response) {
  // Sanitize filename (remove ../, ..\, absolute paths)
  const sanitized = path.basename(filename);

  // Verify file exists in allowed directory
  const filePath = path.join(UPLOAD_CONFIG.directory, sanitized);

  if (!filePath.startsWith(UPLOAD_CONFIG.directory)) {
    throw new BadRequestException('Invalid file path');
  }

  const file = fs.readFileSync(filePath);
  res.setHeader('Content-Disposition', `attachment; filename="${sanitized}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(file);
}
```

---

## Rate Limiting

### API Rate Limiting Setup

```typescript
// apps/api/src/main.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short', // 100 requests per 1 minute
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'long', // 1000 requests per 15 minutes
        ttl: 900000,
        limit: 1000,
      },
    ]),
  ],
})
export class AppModule {}

// Register globally
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new ThrottlerGuard());
```

### Custom Rate Limiting by Endpoint

```typescript
// Stricter limits for auth endpoints
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async login(@Body() credentials: LoginDto) {
    // Allow 5 login attempts per minute
  }

  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async register(@Body() data: RegisterDto) {
    // Strict limit on registration
  }
}

// Looser limits for public endpoints
@Controller('labels')
@UseGuards(ThrottlerGuard)
export class LabelController {
  @Get()
  @Throttle({ long: { limit: 1000, ttl: 900000 } }) // 1000 per 15 min
  async findAll() {
    // Higher limit for read operations
  }

  @Post()
  @Throttle({ short: { limit: 50, ttl: 60000 } }) // 50 per minute
  async create(@Body() dto: CreateLabelDto) {
    // Moderate limit for create operations
  }
}
```

### Rate Limiting by IP Address

```typescript
// Custom rate limiter using Redis
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisRateLimitService {
  constructor(private redis: Redis) {}

  async isAllowed(key: string, limit: number, windowMs: number): Promise<boolean> {
    const current = await this.redis.incr(key);

    if (current === 1) {
      // Set expiration on first request
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
    }

    return current <= limit;
  }
}

// Usage in middleware
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private rateLimitService: RedisRateLimitService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = this.getClientIp(req);
    const allowed = await this.rateLimitService.isAllowed(
      `rate-limit:${ip}`,
      100, // 100 requests
      60000 // per minute
    );

    if (!allowed) {
      throw new TooManyRequestsException('Too many requests, please try again later');
    }

    next();
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}
```

### Batch Operation Rate Limiting

```typescript
@Controller('batch')
export class BatchController {
  @Post('validate')
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 batch jobs per minute
  async validateBatch(@Body() dto: BatchValidateDto) {
    // Limit to prevent resource exhaustion
    if (dto.labelIds.length > 1000) {
      throw new BadRequestException('Maximum 1000 labels per batch');
    }

    return this.batchService.validate(dto);
  }
}
```

---

## Dependency Scanning

### Automated Vulnerability Checks

```bash
# Manual vulnerability scanning
npm audit                   # Lists vulnerabilities
npm audit fix               # Auto-fix non-breaking fixes
npm audit fix --force       # Force latest versions (may break)
npm outdated                # Show outdated packages

# Generate detailed report
npm audit --json > audit-report.json
```

### Pre-commit Vulnerability Scanning

```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm audit --audit-level=moderate
if [ $? -ne 0 ]; then
  echo "❌ Vulnerabilities detected. Run 'npm audit fix'"
  exit 1
fi

pnpm lint-staged
```

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Check for known vulnerabilities
        run: npx snyk test
```

### Dependency Management Best Practices

```json
// package.json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "dependencies": {
    // ✅ Explicitly pin versions or use npm audit-friendly ranges
    "express": "^4.18.0", // Allow patch updates
    "nestjs": "~10.2.0", // Allow minor updates only
    "prisma": "5.7.0" // Explicit version critical libraries
  },
  "devDependencies": {
    // ✅ Keep dev deps up to date
    "typescript": "^5.3.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

### Automated Dependency Updates

```bash
# Enable Dependabot on GitHub
# Create .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
```

---

## Secrets Management

### Development Secrets

```bash
# .env.local (git-ignored for development)
DATABASE_URL="postgresql://user:password@localhost:5432/ttb_label_analyzer"
API_SECRET_KEY="dev-secret-key-not-for-production"
JWT_SECRET="dev-jwt-secret-change-in-production"
CORS_ORIGIN="http://localhost:3000"
LOG_LEVEL="debug"
```

**Never commit**:

- Database passwords
- API keys
- JWT secrets
- AWS/Azure credentials
- OAuth tokens

### Production Secrets Management

#### Option 1: Environment Variables (12-Factor)

```bash
# Deploy with environment variables
export DATABASE_URL="postgresql://prod-user:prod-password@prod-db:5432/ttb"
export JWT_SECRET="$(openssl rand -hex 32)"
export API_TOKEN="$(openssl rand -hex 32)"

npm run start
```

#### Option 2: AWS Secrets Manager

```typescript
// apps/api/src/config/secrets.service.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

@Injectable()
export class SecretsService {
  private client = new SecretsManagerClient({ region: 'us-east-1' });

  async getSecret(secretName: string): Promise<string> {
    try {
      const response = await this.client.send(
        new GetSecretValueCommand({ SecretId: secretName })
      );
      return response.SecretString;
    } catch (error) {
      this.logger.error(`Failed to retrieve secret: ${secretName}`, error);
      throw new Error('Secret retrieval failed');
    }
  }
}

// Usage
constructor(private secretsService: SecretsService) {}

async onModuleInit() {
  const dbPassword = await this.secretsService.getSecret('prod/database/password');
  const jwtSecret = await this.secretsService.getSecret('prod/jwt/secret');
}
```

#### Option 3: HashiCorp Vault

```typescript
// apps/api/src/config/vault.service.ts
import axios from 'axios';

@Injectable()
export class VaultService {
  private vaultUrl = process.env.VAULT_ADDR || 'http://localhost:8200';
  private vaultToken = process.env.VAULT_TOKEN;

  async getSecret(path: string): Promise<Record<string, any>> {
    const response = await axios.get(`${this.vaultUrl}/v1/secret/data/${path}`, {
      headers: {
        'X-Vault-Token': this.vaultToken,
      },
    });
    return response.data.data.data;
  }

  async rotateSecret(path: string): Promise<void> {
    // Automated secret rotation
    const newSecret = this.generateNewSecret();

    await axios.post(
      `${this.vaultUrl}/v1/secret/data/${path}`,
      { data: newSecret },
      {
        headers: { 'X-Vault-Token': this.vaultToken },
      }
    );

    this.logger.log(`Secret rotated: ${path}`);
  }
}
```

### Secret Rotation Strategy

```typescript
// Automatic rotation every 30 days
@Injectable()
export class SecretRotationService {
  private readonly logger = new Logger(SecretRotationService.name);

  @Cron('0 2 * * 0') // Weekly at 2 AM Sunday
  async rotateSecrets() {
    this.logger.log('Starting secret rotation...');

    try {
      // Rotate JWT secret
      const newJwtSecret = this.generateSecret(32);
      await this.vaultService.updateSecret('jwt/secret', newJwtSecret);

      // Rotate API tokens
      const newApiToken = this.generateSecret(32);
      await this.vaultService.updateSecret('api/token', newApiToken);

      // Rotate database password (if supported)
      const newDbPassword = this.generateSecret(32);
      await this.databaseService.changePassword(newDbPassword);

      this.logger.log('Secret rotation completed successfully');
    } catch (error) {
      this.logger.error('Secret rotation failed', error);
      // Alert security team
      await this.alertService.notifySecurityTeam(error);
    }
  }

  private generateSecret(length: number): string {
    return require('crypto').randomBytes(length).toString('hex');
  }
}
```

### Secret Access Audit Logging

```typescript
@Injectable()
export class SecretAuditService {
  async logSecretAccess(secretName: string, userId?: string) {
    await this.auditLog.create({
      timestamp: new Date(),
      action: 'SECRET_ACCESS',
      secretName,
      userId: userId || 'system',
      ipAddress: this.getCallerIp(),
      success: true,
    });
  }

  async trackSecretRotation(secretName: string) {
    await this.auditLog.create({
      timestamp: new Date(),
      action: 'SECRET_ROTATED',
      secretName,
      userId: 'system',
    });
  }
}
```

---

## OWASP Top 10

### 1. SQL Injection

**Status**: ✅ **Mitigated**

```typescript
// ❌ Vulnerable
const query = `SELECT * FROM labels WHERE brand = '${brandName}'`;

// ✅ Safe - Using Prisma
const label = await prisma.label.findFirst({
  where: { brandName: brandName },
});
```

### 2. Broken Authentication

**Status**: 🔶 **Planned**

```typescript
// Implement JWT authentication
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
})
export class AuthModule {}

@UseGuards(JwtAuthGuard)
@Post('protected')
async protectedRoute() {
  // Only authenticated users
}
```

### 3. Sensitive Data Exposure

**Status**: 🟡 **Partially Mitigated**

```typescript
// ✅ Encrypted passwords
import { bcrypt } from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);

// ✅ No sensitive data in logs
logger.info('User login', { userId, email: maskEmail(email) }); // NOT password

// ✅ HTTPS enforced
app.useGlobalInterceptors(new HttpsRedirectInterceptor());

// ✅ Secure cookies
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only
      httpOnly: true, // No JS access
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
```

### 4. XML External Entities (XXE)

**Status**: ✅ **Mitigated**

```typescript
// ✅ Use safe XML parser with DTD disabled
import { simpleParser } from 'mailparser';

const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  attributeNamePrefix: '@_',
  // Disable external entities
  processEntities: false,
  resolveNameSpace: false,
});

// ✅ Or just use JSON (recommended)
const data = JSON.parse(userInput); // Safer than XML
```

### 5. Broken Access Control

**Status**: 🔶 **Planned**

```typescript
// Implement RBAC
@UseGuards(RoleGuard)
@Controller('admin')
export class AdminController {
  @Delete('labels/:id')
  @Roles(['admin', 'moderator'])
  async deleteLabel(@Param('id') labelId: string) {
    // Only admins and moderators can delete
  }

  @Get('reports')
  @Roles(['admin'])
  async generateReport() {
    // Admins only
  }
}
```

### 6. Security Misconfiguration

**Status**: ✅ **Mitigated**

```typescript
// Helmet for security headers
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));

// CORS configuration
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Disable unnecessary headers
app.disable('x-powered-by');
```

### 7. Cross-Site Scripting (XSS)

**Status**: ✅ **Mitigated**

```typescript
// ✅ React auto-escapes content
const userInput = "<script>alert('xss')</script>";
return <div>{userInput}</div>;  // Renders safely as text

// ✅ HTML sanitization when needed
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: ['p', 'br', 'strong'],
});

// ✅ Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],  // No inline scripts
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data'],
    },
  })
);
```

### 8. Insecure Deserialization

**Status**: ✅ **Mitigated**

```typescript
// ✅ Never use eval() or unsafe deserialization
// ❌ BAD
eval(userCode); // NEVER

// ✅ GOOD
const parsed = JSON.parse(userJsonString); // With validation

// ✅ Validate deserialized objects
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

const obj = plainToClass(UserDto, jsonData);
const errors = await validate(obj);

if (errors.length > 0) {
  throw new BadRequestException('Invalid data');
}
```

### 9. Using Components with Known Vulnerabilities

**Status**: ✅ **Monitored**

```bash
# Regular security audits
npm audit --audit-level=moderate

# GitHub Dependabot enabled
# Snyk notifications enabled

# Update schedule
npm update --save
pnpm update --interactive
```

### 10. Insufficient Logging & Monitoring

**Status**: 🟡 **Partially Implemented**

```typescript
// ✅ Comprehensive logging
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;

    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;

        this.logger.info('HTTP Request', {
          method,
          url,
          status: response.statusCode,
          duration,
          userId: request.user?.id,
          // Never log passwords, tokens, etc.
        });
      }),
      catchError((error) => {
        this.logger.error('HTTP Error', {
          method,
          url,
          error: error.message,
          stack: error.stack,
          userId: request.user?.id,
        });
        throw error;
      })
    );
  }
}

// ✅ Alert on suspicious activity
@Injectable()
export class SecurityAlertService {
  async checkSuspiciousActivity() {
    const failedLogins = await this.auditLog.count({
      where: {
        action: 'FAILED_LOGIN',
        timestamp: { gte: new Date(Date.now() - 60000) },
      },
    });

    if (failedLogins > 5) {
      await this.alertService.notifySecurityTeam(
        `⚠️ ${failedLogins} failed login attempts in last minute`
      );
    }
  }
}
```

---

## Authentication & Authorization

### JWT Implementation (Planned)

```typescript
// apps/api/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Role-Based Access Control (RBAC)

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = Reflect.getMetadata('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role required
    }

    return requiredRoles.includes(user?.role);
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

## Data Protection

### Encryption at Rest

```typescript
// Encrypt sensitive fields
import { FieldEncryptionService } from '@nest-modules/crypt';

@Injectable()
export class LabelService {
  async create(dto: CreateLabelDto) {
    // Sensitive fields encrypted before storage
    const encryptedData = await this.encryptionService.encrypt({
      producerEmail: dto.producerEmail, // Encrypted in DB
      apiKey: dto.apiKey,
    });

    return this.prisma.label.create({
      data: {
        ...dto,
        ...encryptedData,
      },
    });
  }
}
```

### Data Retention Policy

```typescript
// Automatic data deletion
@Injectable()
export class DataRetentionService {
  @Cron('0 3 * * *') // 3 AM daily
  async cleanupExpiredData() {
    const retentionDate = new Date(
      Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year
    );

    // Delete old validation results
    await this.prisma.validationResult.deleteMany({
      where: {
        createdAt: { lt: retentionDate },
      },
    });

    this.logger.log('Data retention cleanup completed');
  }
}
```

---

## Infrastructure Security

### Docker Security

```dockerfile
# Secure Dockerfile
FROM node:20-alpine

# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Security: non-root user
USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD npm run health || exit 1

CMD ["node", "dist/main.js"]
```

### Network Security

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    networks:
      - ttb_network
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./apps/api
    networks:
      - ttb_network
    expose: # Only expose to network, not publicly
      - 3001
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/ttb_label_analyzer

  web:
    build: ./apps/web
    networks:
      - ttb_network
    ports:
      - '3000:3000' # Only web exposed publicly

networks:
  ttb_network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: br-ttb

volumes:
  postgres_data:
```

---

## Compliance & Audit

### TTB Compliance

```typescript
// Audit logging for regulatory compliance
@Injectable()
export class AuditLogService {
  async logValidation(labelId: string, result: ValidationResult) {
    await this.auditLog.create({
      action: 'LABEL_VALIDATED',
      entityType: 'Label',
      entityId: labelId,
      details: {
        tтbRulesChecked: result.ttbValidationResult,
        isCompliant: result.isCompliant,
        timestamp: new Date().toISOString(),
      },
      userId: this.getCurrentUserId(),
    });
  }

  async generateComplianceReport(startDate: Date, endDate: Date) {
    const audits = await this.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        action: 'LABEL_VALIDATED',
      },
    });

    return {
      period: { startDate, endDate },
      totalValidations: audits.length,
      complianceRate: this.calculateComplianceRate(audits),
      auditEntries: audits,
    };
  }
}
```

---

## Security Checklist

### Before Development

- [ ] Read this security policy
- [ ] Configure IDE security plugins
- [ ] Enable file encryption on local machine
- [ ] Use strong passwords for all services

### During Development

- [ ] Never commit secrets or credentials
- [ ] Use meaningful variable names (avoid passwords in code)
- [ ] Validate all user inputs
- [ ] Log security-relevant events
- [ ] Test error messages don't leak info

### Before Deployment

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review environment variables
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS correctly
- [ ] Set security headers
- [ ] Enable rate limiting
- [ ] Configure backups
- [ ] Test disaster recovery

### In Production

- [ ] Monitor audit logs
- [ ] Set up security alerts
- [ ] Perform regular backups
- [ ] Track dependency updates
- [ ] Review access logs monthly
- [ ] Conduct security training
- [ ] Plan penetration testing

---

## Incident Response

### Security Incident Reporting

**Found a vulnerability?**

1. **Do NOT disclose publicly**
2. **Email**: security@company.com (add when applicable)
3. **Provide**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Incident Response Process

1. **Acknowledge** (within 24 hours)
2. **Investigate** (assess severity)
3. **Fix** (develop and test patch)
4. **Deploy** (apply fix in production)
5. **Verify** (confirm fix works)
6. **Disclose** (responsibly via security advisory)
7. **Retrospect** (prevent future occurrences)

### Severity Levels

| Level        | Definition                       | Response Time |
| ------------ | -------------------------------- | ------------- |
| **Critical** | Immediate risk to data/system    | 1 hour        |
| **High**     | Significant security risk        | 4 hours       |
| **Medium**   | Moderate risk, workaround exists | 1 week        |
| **Low**      | Minor issue, no immediate risk   | 30 days       |

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [NestJS Security](https://docs.nestjs.com/security/overview)
- [TTB Regulations](https://www.ttb.gov/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Snyk Vulnerability Database](https://snyk.io/)

---

## Version History

| Date       | Version | Changes                 |
| ---------- | ------- | ----------------------- |
| 2024-03-06 | 1.0.0   | Initial security policy |

---

**Last Review**: March 6, 2024  
**Next Review**: June 6, 2024 (Quarterly)  
**Maintained By**: Security Team

## Input Validation

### Frontend (Zod)

```typescript
const labelSchema = z.object({
  brandName: z.string().min(1),
  alcoholByVolume: z.number().min(0).max(100),
  netContents: z.string().min(1),
});
```

### Backend (class-validator)

```typescript
export class CreateLabelDto {
  @IsString()
  brandName: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  alcoholByVolume: number;
}
```

### Protections

- Whitelist validation
- Type coercion disabled
- Forbidden property rejection

## Database Security

### Parameterized Queries

All database queries use Prisma, which automtically uses parameterized queries:

```typescript
// Safe - Prisma handles parameterization
await prisma.label.create({ data: labelData });
await prisma.label.findUnique({ where: { id: userId } });
```

### Connection Security

- Environment-based credentials
- SSL/TLS connections (configurable)
- Connection pooling with timeouts
- No hardcoded credentials

### Access Control

- User data isolated by context
- Row-level security ready (future)
- Audit logging of all data modifications

## API Security

### Headers

- CORS headers properly configured
- X-Frame-Options: DENY (Clickjacking protection)
- Strict-Transport-Security (HSTS) via reverse proxy
- Content-Security-Policy configurable

### Rate Limiting

- Implement using NestJS Throttle guard (future)
- Per-IP rate limiting
- Per-user rate limiting for authenticated endpoints

### Request Size Limits

```typescript
// File upload size limits
UPLOAD_MAX_SIZE = 52428800; // 50MB
```

## Environment Configuration

### Sensitive Data

Never commit sensitive values:

```bash
# .env.example contains only template
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# .env.local (git-ignored) contains actual values
DATABASE_URL="postgresql://actual-user:actual-pass@prod-host:5432/prod-db"
```

### Environment Validation

```typescript
// config.service.ts validates required variables
validateConfig() {
  const required = ['DATABASE_URL'];
  const missing = required.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing: ${missing.join(', ')}`);
  }
}
```

## Secrets Management

### Development

- Use `.env.local` (git-ignored)
- Short-lived credentials
- Separate test database

### Production (Future Recommendations)

- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Environment-based secret rotation
- Audit logging for secret access

## Data Protection

### Encryption at Rest

- Database disk encryption (OS/cloud-level)
- Sensitive fields encrypted at application level (future)

### Encryption in Transit

- HTTPS/TLS for all communications
- HTTP2 for better performance
- TLS 1.2+ required (future policy)

### Data Retention

- Define retention policies per data type
- Implement data archival
- Secure deletion procedures
- GDPR/CCPA compliance (future)

## Logging & Monitoring

### What Not to Log

```typescript
// ❌ Never log sensitive data
console.log('User:', { password, apiKey });

// ✅ Safe logging
console.log('User login:', { userId, email: maskEmail(email) });
```

### Structured Logging

- Request/response logging
- Error tracking with stack traces
- Audit trail for critical operations
- Correlation IDs for tracing

### Log Security

- Logs not exposed publicly
- Central log aggregation (future)
- Access control to log storage
- Sensitive data masks in logs

## Common Vulnerabilities (OWASP Top 10)

### 1. Injection (SQL Injection, NoSQL Injection)

**Mitigation**: Parameterized queries via Prisma

### 2. Broken Authentication

**Mitigation** (Future):

- Strong password policies
- Multi-factor authentication
- Session management
- Password reset security

### 3. Sensitive Data Exposure

**Mitigation**:

- TLS/HTTPS for all data in transit
- No sensitive data in logs
- Encryption for sensitive fields

### 4. XML External Entities (XXE)

**Mitigation**:

- Input validation
- Disable XML external entity parsing
- Use safe XML/JSON parsers

### 5. Broken Access Control

**Mitigation** (Future):

- RBAC implementation
- Principle of least privilege
- Audit logging
- Regular access reviews

### 6. Security Misconfiguration

**Mitigation**:

- Security headers enabled
- Default credentials removed
- Unnecessary services disabled
- Keep dependencies updated

### 7. Cross-Site Scripting (XSS)

**Mitigation**:

- React auto-escapes content
- Content Security Policy (future)
- Input validation
- Output encoding

### 8. Insecure Deserialization

**Mitigation**:

- Validate user input strictly
- No unsafe `eval()`
- Type-safe serialization

### 9. Using Components with Known Vulnerabilities

**Mitigation**:

- Regular `npm audit` checks
- Automated vulnerability scanning (Snyk/Dependabot)
- Timely security updates

### 10. Insufficient Logging & Monitoring

**Mitigation**:

- Comprehensive logging
- Alert on suspicious activity
- Regular log reviews

## Dependency Security

### Vulnerability Scanning

```bash
npm audit                # Find vulnerabilities
npm audit fix            # Auto-fix where possible
npm audit fix --force    # Force-fix (may break compatibility)
```

### Automated Updates

- Dependabot for GitHub
- Renovate for automated PRs
- Regular dependency audits

### Principle of Least Privilege

- Minimal dependency set
- Avoid monolithic packages
- Regular dependency review

## Code Security

### Type Safety

- Strict TypeScript mode
- No `any` types
- Full type coverage

### Code Review

- Peer review process
- Security-focused review
- Automated linting/formatting

### SAST (Static Application Security Testing)

- ESLint security plugins (future)
- SonarQube integration (future)
- OWASP dependency check

## Infrastructure Security

### Docker Security

- Non-root user in containers
- Read-only file systems where possible
- Health checks configured
- Resource limits defined

### Network Security

- CORS restrictions
- Firewall rules
- VPC isolation (cloud deployments)
- No expose internal services

### Database Security

- Separate credentials per environment
- Network isolation
- Backup encryption
- Replication with failover

## Compliance

### Personal Data Protection

- GDPR-ready (future implementation)
- CCPA compliance (future implementation)
- Data processing agreements
- Privacy policy documentation

### Data Residency

- Data location compliance
- Regional restrictions
- Data sovereignty requirements

### Audit Requirements

- TTB regulatory compliance
- FDA 21 CFR Part 11 (future if applicable)
- SOC 2 compliance roadmap

## Security Checklist

### Development

- [ ] No hardcoded credentials
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak info
- [ ] CORS properly configured
- [ ] HTTPS in production
- [ ] Dependencies audited
- [ ] Security headers set

### Deployment

- [ ] Secrets in environment variables
- [ ] Database credentials secure
- [ ] Firewall configured
- [ ] HTTPS/TLS enabled
- [ ] Regular backups taken
- [ ] Monitoring enabled
- [ ] Logging configured

### Operations

- [ ] Regular security updates
- [ ] Vulnerability scanning
- [ ] Access reviews quarterly
- [ ] Incident response plan
- [ ] Disaster recovery tested
- [ ] Penetration testing (annual)
- [ ] Security training for team

## Incident Response

### Reporting Security Issues

- Email: security@company.com (future)
- Don't disclose publicly until fixed
- Private security advisory
- Coordinated disclosure timeline

### Response Process

1. Acknowledge receipt within 24 hours
2. Investigate and assess severity
3. Develop and test fix
4. Deploy fix
5. Verify fix
6. Disclose responsibly
7. Post-mortem analysis

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [NestJS Security](https://docs.nestjs.com/security/overview)
- [TTB Regulations](https://www.ttb.gov/)

## Future Security Enhancements

1. **Multi-factor Authentication (MFA)**
2. **API Rate Limiting**
3. **Advanced Threat Detection**
4. **Penetration Testing Program**
5. **Security Operations Center (SOC)**
6. **SIEM Integration**
7. **Zero-trust Architecture**
8. **Hardware Security Keys**
9. **Cryptographic Key Management**
10. **Compliance Automation**
