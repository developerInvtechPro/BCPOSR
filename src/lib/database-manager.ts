import { PrismaClient } from '@prisma/client';

// Tipos de usuario de base de datos
export type DatabaseUserType = 'readonly' | 'cajero' | 'mesero' | 'gerente' | 'admin' | 'app';

// Configuración de usuarios de base de datos
const DATABASE_CONFIGS = {
  readonly: process.env.DB_READONLY_URL || process.env.DATABASE_URL,
  cajero: process.env.DB_CAJERO_URL || process.env.DATABASE_URL,
  mesero: process.env.DB_MESERO_URL || process.env.DATABASE_URL,
  gerente: process.env.DB_GERENTE_URL || process.env.DATABASE_URL,
  admin: process.env.DB_ADMIN_URL || process.env.DATABASE_URL,
  app: process.env.DATABASE_URL
};

// Cache de clientes Prisma por tipo de usuario
const prismaClients: Partial<Record<DatabaseUserType, PrismaClient>> = {};

/**
 * Obtiene un cliente Prisma configurado para el tipo de usuario especificado
 */
export function getPrismaClient(userType: DatabaseUserType = 'app'): PrismaClient {
  // Si ya existe un cliente para este tipo de usuario, lo devolvemos
  if (prismaClients[userType]) {
    return prismaClients[userType]!;
  }

  // Crear nuevo cliente con la configuración específica
  const databaseUrl = DATABASE_CONFIGS[userType];
  
  if (!databaseUrl) {
    throw new Error(`No se encontró configuración de base de datos para el tipo de usuario: ${userType}`);
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

  // Guardar en cache
  prismaClients[userType] = client;

  return client;
}

/**
 * Obtiene el cliente Prisma basado en el rol del usuario de la aplicación
 */
export function getPrismaClientByRole(role: string): PrismaClient {
  const userTypeMap: Record<string, DatabaseUserType> = {
    'admin': 'admin',
    'gerente': 'gerente',
    'cajero': 'cajero',
    'mesero': 'mesero',
    'readonly': 'readonly'
  };

  const userType = userTypeMap[role] || 'app';
  return getPrismaClient(userType);
}

/**
 * Cierra todas las conexiones de base de datos
 */
export async function disconnectAll(): Promise<void> {
  const disconnectPromises = Object.values(prismaClients).map(client => 
    client?.$disconnect()
  );
  
  await Promise.all(disconnectPromises);
  
  // Limpiar cache
  Object.keys(prismaClients).forEach(key => {
    delete prismaClients[key as DatabaseUserType];
  });
}

/**
 * Verifica la conexión para un tipo de usuario específico
 */
export async function testConnection(userType: DatabaseUserType): Promise<boolean> {
  try {
    const client = getPrismaClient(userType);
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error(`Error de conexión para usuario ${userType}:`, error);
    return false;
  }
}

/**
 * Obtiene información sobre las conexiones disponibles
 */
export async function getConnectionInfo(): Promise<Record<DatabaseUserType, { connected: boolean; url: string }>> {
  const info: Partial<Record<DatabaseUserType, { connected: boolean; url: string }>> = {};
  
  for (const [userType, url] of Object.entries(DATABASE_CONFIGS)) {
    const connected = await testConnection(userType as DatabaseUserType);
    info[userType as DatabaseUserType] = {
      connected,
      url: url?.replace(/:[^:@]*@/, ':***@') || 'No configurado' // Ocultar contraseña
    };
  }
  
  return info as Record<DatabaseUserType, { connected: boolean; url: string }>;
}

/**
 * Ejecuta una operación con un cliente específico y maneja errores de permisos
 */
export async function executeWithFallback<T>(
  operation: (client: PrismaClient) => Promise<T>,
  preferredUserType: DatabaseUserType = 'app',
  fallbackUserType: DatabaseUserType = 'app'
): Promise<T> {
  try {
    const client = getPrismaClient(preferredUserType);
    return await operation(client);
  } catch (error: any) {
    // Si es un error de permisos, intentar con el usuario de fallback
    if (error.message?.includes('permission') || error.message?.includes('access')) {
      console.warn(`Error de permisos con usuario ${preferredUserType}, intentando con ${fallbackUserType}`);
      const fallbackClient = getPrismaClient(fallbackUserType);
      return await operation(fallbackClient);
    }
    throw error;
  }
}

/**
 * Middleware para operaciones de solo lectura
 */
export async function readOnlyOperation<T>(
  operation: (client: PrismaClient) => Promise<T>
): Promise<T> {
  return executeWithFallback(operation, 'readonly', 'app');
}

/**
 * Middleware para operaciones de escritura según el rol
 */
export async function writeOperation<T>(
  operation: (client: PrismaClient) => Promise<T>,
  userRole: string = 'app'
): Promise<T> {
  const userType = userRole === 'admin' ? 'admin' : 
                   userRole === 'gerente' ? 'gerente' :
                   userRole === 'cajero' ? 'cajero' :
                   userRole === 'mesero' ? 'mesero' : 'app';
  
  return executeWithFallback(operation, userType, 'app');
}

// Cliente por defecto para compatibilidad
export const prisma = getPrismaClient('app'); 