import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execute = promisify(exec);

const handler = async (m, { conn }) => {
    // Reacción de espera
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    await m.reply('*🔍 Buscando actualizaciones en GitHub...*');

    try {
        // 1. Traer cambios del repositorio
        await execute('git fetch origin');
        
        // 2. Verificar si hay algo nuevo
        const { stdout: status } = await execute('git status -uno');

        if (status.includes('Your branch is up to date') || status.includes('tu rama está actualizada')) {
            return await m.reply('✅ *DekuBot MD ya está en su versión más reciente.*');
        }

        await m.reply('*📥 Descargando cambios y actualizando...*');

        // 3. Aplicar los cambios
        const { stdout: pullLog } = await execute('git pull');
        
        console.log(chalk.green('[UPDATE SUCCESS]'), pullLog);

        await m.reply(`🚀 *Actualización Exitosa*\n\n${pullLog}\n\n> El bot se reiniciará para aplicar los cambios.`);

        // 4. Reiniciar proceso
        // Esto funciona si usas PM2 o un script de inicio automático (start.sh)
        process.exit(0); 

    } catch (e) {
        console.error(chalk.red('[ERROR UPDATE]'), e);
        await m.reply('❌ *Ocurrió un error al actualizar:* \n' + e.message);
    }
};

// --- IMPORTANTE: ESTO UBICA AL COMANDO EN TU MENÚ ---
handler.help = ['update']; // Lo que se muestra en la lista
handler.tags = ['owner'];  // La categoría donde aparecerá (🛡️ OWNER TOOLS)
handler.command = ['update', 'actualizar']; // Disparadores del comando
handler.rowner = true; // Solo el dueño puede usarlo (si tu handler lo soporta)

export default handler;
