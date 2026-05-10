import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execute = promisify(exec);

const handler = async (m, { conn, from }) => {
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
    await m.reply('*🔍 Buscando actualizaciones en GitHub...*');

    try {
        // --- PARCHE PARA "DUBIOUS OWNERSHIP" ---
        // Marcamos la carpeta como segura para que Git no se queje
        const path = '/storage/emulated/0/PremBots/DekuBotMD';
        await execute(`git config --global --add safe.directory ${path}`).catch(() => {});

        // Verificar si es un repo, si no, vincularlo
        try {
            await execute('git remote -v');
        } catch (err) {
            console.log(chalk.yellow('[SISTEMA] Configurando repositorio...'));
            await execute('git init');
            await execute('git remote add origin https://github.com/CrizZapp/DekuBotMD');
        }

        await execute('git fetch origin');
        
        const { stdout: status } = await execute('git status -uno');

        if (status.includes('Your branch is up to date') || status.includes('tu rama está actualizada')) {
            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
            return await m.reply('✅ *DekuBot MD ya está en su versión más reciente.*');
        }

        await m.reply('*📥 Descargando cambios...*');

        // Intentar pull forzando la rama main o master
        const { stdout: pullLog } = await execute('git pull origin main || git pull origin master');
        
        console.log(chalk.green('[UPDATE SUCCESS]'), pullLog);

        await m.reply(`🚀 *Actualización Exitosa*\n\n\`\`\`${pullLog}\`\`\`\n\n> Reiniciando sistema...`);

        setTimeout(() => {
            process.exit(0);
        }, 3000);

    } catch (e) {
        console.error(chalk.red('[ERROR UPDATE]'), e);
        await m.reply('❌ *Error de permisos/Git:* \n' + e.message);
    }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'actualizar'];
handler.rowner = true; 

export default handler;
