import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, { conn }) => {
    try {

        const pluginsDir = path.join(__dirname, '../plugins'); 
        
        
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        

        global.plugins = {};

        for (const file of pluginFiles) {
            const filePath = path.join(pluginsDir, file);
            

            const modulePath = `${filePath}?update=${Date.now()}`;
            
            const imported = await import(modulePath);
            global.plugins[file] = imported.default || imported;
        }

        await conn.sendMessage(m.key.remoteJid, { text: `✅ Se han recargado *${pluginFiles.length}* plugins correctamente.` }, { quoted: m });
        console.log(chalk.greenBright('[SISTEMA] Plugins actualizados con éxito.'));

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.key.remoteJid, { text: '❌ Error al recargar los plugins.' }, { quoted: m });
    }
};



handler.help = ['update', 'up'] 
handler.tags = ['owner']       
handler.command = ['up', 'update']


export default handler;
