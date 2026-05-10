import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execute = promisify(exec);

const handler = async (m, { conn, from }) => {
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
    await m.reply('*🔍 Buscando actualizaciones en GitHub...*');

    try {
        // --- AQUÍ VA LA MAGIA PARA EVITAR EL ERROR DE "NOT A GIT REPOSITORY" ---
        try {
            await execute('git remote -v');
        } catch (err) {
            // Si el comando falla, es que no hay repo. Lo creamos:
            console.log(chalk.yellow('[SISTEMA] No se detectó un repo Git. Vinculando...'));
            await execute('git init');
            await execute('git remote add origin https://github.com/CrizZapp/DekuBotMD');
        }
        // -----------------------------------------------------------------------

        await execute('git fetch origin');
        
        const { stdout: status } = await execute('git status -uno');

        if (status.includes('Your branch is up to date') || status.includes('tu rama está actualizada')) {
            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
            return await m.reply('✅ *DekuBot MD ya está en su versión más reciente.*');
        }

        await m.reply('*📥 Descargando cambios y actualizando...*');

        // Forzamos el pull para evitar conflictos de archivos locales
        const { stdout: pullLog } = await execute('git pull origin main || git pull origin master');
        
        console.log(chalk.green('[UPDATE SUCCESS]'), pullLog);

        await m.reply(`🚀 *Actualización Exitosa*\n\n\`\`\`${pullLog}\`\`\`\n\n> El bot se reiniciará en 3 segundos.`);

        setTimeout(() => {
            process.exit(0);
        }, 3000);

    } catch (e) {
        console.error(chalk.red('[ERROR UPDATE]'), e);
        await m.reply('❌ *Ocurrió un error fatal:* \n' + e.message);
    }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'actualizar'];
handler.rowner = true; 

export default handler;
