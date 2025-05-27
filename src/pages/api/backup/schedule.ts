import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { servicio, frecuencia, hora, mantenerBackups } = req.body;

  if (!servicio || !['google', 'onedrive'].includes(servicio)) {
    return res.status(400).json({ error: 'Servicio inválido' });
  }

  if (!frecuencia || !['diario', 'semanal', 'mensual'].includes(frecuencia)) {
    return res.status(400).json({ error: 'Frecuencia inválida' });
  }

  try {
    // Verificar si crontab está disponible
    await execAsync('which crontab');

    // Determinar script de backup
    const scriptName = servicio === 'google' ? 'backup-google-drive.sh' : 'backup-onedrive.sh';
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);

    // Crear expresión cron según la frecuencia
    let cronExpression = '';
    const [horaNum, minuto] = hora.split(':');
    
    switch (frecuencia) {
      case 'diario':
        cronExpression = `${minuto} ${horaNum} * * *`;
        break;
      case 'semanal':
        cronExpression = `${minuto} ${horaNum} * * 0`; // Domingo
        break;
      case 'mensual':
        cronExpression = `${minuto} ${horaNum} 1 * *`; // Día 1 de cada mes
        break;
    }

    // Comando completo para crontab
    const logPath = path.join(process.cwd(), 'logs', 'backup.log');
    const backupCommand = `cd ${process.cwd()} && bash "${scriptPath}" >> "${logPath}" 2>&1`;
    const cronEntry = `${cronExpression} ${backupCommand}`;

    // Obtener crontab actual y filtrar entradas del sistema POS
    let currentCrontab = '';
    try {
      const { stdout } = await execAsync('crontab -l');
      currentCrontab = stdout;
    } catch {
      // No hay crontab existente, está bien
    }

    // Filtrar entradas existentes del sistema POS
    const lines = currentCrontab.split('\n').filter(line => 
      !line.includes('Sistema POS Honduras') && 
      !line.includes(scriptPath) &&
      line.trim() !== ''
    );

    // Agregar nueva entrada
    lines.push('# Sistema POS Honduras - Backup automático');
    lines.push(cronEntry);

    // Escribir nuevo crontab
    const newCrontab = lines.join('\n') + '\n';
    await execAsync(`echo "${newCrontab}" | crontab -`);

    // Crear directorio de logs si no existe
    await execAsync(`mkdir -p "${path.dirname(logPath)}"`);

    return res.status(200).json({
      success: true,
      message: 'Backup automático programado exitosamente',
      schedule: {
        servicio,
        frecuencia,
        hora,
        cronExpression,
        nextRun: calcularProximaEjecucion(cronExpression),
        logFile: logPath,
        mantenerBackups
      }
    });

  } catch (error) {
    console.error('Error scheduling backup:', error);
    
    if ((error as Error).toString().includes('crontab: command not found')) {
      return res.status(500).json({ 
        error: 'crontab no está disponible en este sistema',
        alternative: 'Configure manualmente o use un administrador de tareas'
      });
    }

    return res.status(500).json({ 
      error: 'Error al programar backup automático',
      details: (error as Error).toString()
    });
  }
}

// Función auxiliar para calcular próxima ejecución (simplificada)
function calcularProximaEjecucion(cronExpression: string): string {
  const ahora = new Date();
  const [minuto, hora, dia, mes, diaSemana] = cronExpression.split(' ');
  
  // Lógica simplificada - en producción usaría una librería como node-cron
  const proximaFecha = new Date(ahora);
  proximaFecha.setHours(parseInt(hora), parseInt(minuto), 0, 0);
  
  if (proximaFecha <= ahora) {
    proximaFecha.setDate(proximaFecha.getDate() + 1);
  }
  
  return proximaFecha.toLocaleString('es-HN');
} 