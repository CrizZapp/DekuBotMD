import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execute = promisify(exec);

const handler = async (m, { conn, from }) => {
    // 1. Reacción de espera (Usamos 'from' que ya tienes en el handler principal)
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
    
    await m.reply('*🔍 Buscando actualizaciones en GitHub...*');

    try {
        // 2. Traer cambios del repositorio
        await execute('git fetch origin');
        
        // 3. Verificar estado
        const { stdout: status } = await execute('git status -uno');

        if (status.includes('Your branch is up to date') || status.includes('tu rama está actualizada')) {
            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
            return await m.reply('✅ *DekuBot MD ya está en su versión más reciente.*');
        }

        await m.reply('*📥 Descargando cambios y actualizando...*');

        // 4. Aplicar los cambios
        const { stdout: pullLog } = await execute('git pull');
        
        console.log(chalk.green('[UPDATE SUCCESS]'), pullLog);

        await m.reply(`🚀 *Actualización Exitosa*\n\n\`\`\`${pullLog}\`\`\`\n\n> El bot se reiniciará para aplicar los cambios.`);

        // 5. Reiniciar proceso
        // Esperamos un poco para que el mensaje llegue antes de morir
        setTimeout(async () => {
            process.exit(0);
        }, 3000);

    } catch (e) {
        console.error(chalk.red('[ERROR UPDATE]'), e);
        await m.reply('❌ *Ocurrió un error al actualizar:* \n' + e.message);
    }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'actualizar'];
handler.rowner = true; 

export default handler;
