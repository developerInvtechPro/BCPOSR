import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { servicio } = req.body;

  if (!servicio || !['google', 'onedrive'].includes(servicio)) {
    return res.status(400).json({ error: 'Servicio inválido' });
  }

  try {
    // Verificar si rclone está instalado
    await execAsync('rclone version');

    const remoteName = servicio === 'google' ? 'gdrive' : 'onedrive';
    const storageType = servicio === 'google' ? 'drive' : 'onedrive';

    // En un entorno de producción, esto requeriría un flujo más complejo
    // Por ahora, retornamos instrucciones para configuración manual
    return res.status(200).json({
      success: true,
      message: `Para configurar ${servicio}, ejecute los siguientes comandos:`,
      instructions: [
        `1. Abra terminal`,
        `2. Ejecute: rclone config`,
        `3. Seleccione "n" para nuevo remote`,
        `4. Nombre: ${remoteName}`,
        `5. Tipo: ${storageType}`,
        `6. Siga las instrucciones para autorizar la cuenta`,
        `7. Una vez configurado, vuelva a probar la conexión`
      ],
      needsManualConfig: true
    });

  } catch (error) {
    console.error('Error configuring cloud service:', error);
    
    if ((error as Error).toString().includes('rclone: command not found')) {
      return res.status(400).json({ 
        error: 'rclone no está instalado',
        needsRclone: true,
        installInstructions: {
          macos: 'brew install rclone',
          linux: 'curl https://rclone.org/install.sh | sudo bash',
          windows: 'Descargue desde https://rclone.org/downloads/'
        },
        message: 'Para usar el backup en la nube, primero debe instalar rclone'
      });
    }

    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: (error as Error).toString()
    });
  }
} 