import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar si rclone ya está instalado
    try {
      await execAsync('rclone version');
      return res.status(200).json({
        success: true,
        message: 'rclone ya está instalado',
        alreadyInstalled: true
      });
    } catch {
      // rclone no está instalado, proceder con la instalación
    }

    // Ejecutar script de instalación
    const scriptPath = path.join(process.cwd(), 'scripts', 'install-rclone.sh');
    
    try {
      const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`, {
        timeout: 300000 // 5 minutos timeout
      });

      // Verificar si la instalación fue exitosa
      try {
        await execAsync('rclone version');
        return res.status(200).json({
          success: true,
          message: 'rclone instalado exitosamente',
          output: stdout,
          needsRestart: true
        });
      } catch {
        return res.status(500).json({
          error: 'Instalación completada pero rclone no está disponible',
          output: stdout,
          stderr: stderr,
          needsRestart: true
        });
      }

    } catch (error) {
      console.error('Error installing rclone:', error);
      
      return res.status(500).json({
        error: 'Error durante la instalación de rclone',
        details: (error as Error).toString(),
        needsManualInstall: true,
        manualInstructions: {
          macos: 'brew install rclone',
          linux: 'curl https://rclone.org/install.sh | sudo bash',
          windows: 'Descargue desde https://rclone.org/downloads/'
        }
      });
    }

  } catch (error) {
    console.error('Error in install-rclone endpoint:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: (error as Error).toString()
    });
  }
} 