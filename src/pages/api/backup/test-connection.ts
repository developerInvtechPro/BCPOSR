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

    // Verificar si el servicio está configurado
    const remoteName = servicio === 'google' ? 'gdrive' : 'onedrive';
    const { stdout } = await execAsync('rclone listremotes');
    
    if (!stdout.includes(`${remoteName}:`)) {
      return res.status(400).json({
        error: `El servicio ${servicio} no está configurado`,
        needsConfig: true,
        message: `Configure primero ${servicio} usando el botón "CONFIGURAR"`
      });
    }

    // Probar la conexión listando archivos
    await execAsync(`rclone ls ${remoteName}: --max-depth 1`);

    return res.status(200).json({
      success: true,
      message: `Conexión con ${servicio} exitosa`,
      status: 'conectado'
    });

  } catch (error) {
    console.error('Error testing cloud connection:', error);
    
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

    if ((error as Error).toString().includes('connection failed') || 
        (error as Error).toString().includes('unauthorized')) {
      return res.status(400).json({
        error: 'Error de autenticación',
        needsReauth: true,
        message: `Vuelva a configurar ${servicio} o verifique sus credenciales`
      });
    }

    return res.status(500).json({ 
      error: 'Error al probar la conexión',
      details: (error as Error).toString()
    });
  }
} 