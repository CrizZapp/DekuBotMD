import { execSync } from 'child_process'
import chalk from 'chalk'

var handler = async (m, { conn, from, text }) => {
  // Reacción manual ya que tu handler no tiene m.react
  await conn.sendMessage(from, { react: { text: "⏳", key: m.key } })
  
  try {
    execSync(`git config --global --add safe.directory ${process.cwd()}`)

    // 1. "Stash": Guarda los cambios locales en un lugar temporal para dejar el camino limpio
    execSync('git stash')
    
    // 2. Intentamos el pull directamente de la rama remota
    // Usamos origin/master para evitar el error de "no tracking information"
    const stdout = execSync('git pull origin master')
    let messager = stdout.toString()

    if (messager.includes('Already up to date') || messager.includes('Ya está al día')) {
      messager = '✅ *DekuBot MD ya está actualizado.*'
    } else {
      messager = '🚀 *Actualización exitosa:*\n\n' + stdout.toString()
    }

    // 3. (Opcional) Si quieres recuperar tus cambios locales después del pull:
    // execSync('git stash pop') 

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } })
    await conn.sendMessage(from, {
      text: messager,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: 'DEKU BOT MD - UPDATE',
          body: 'Sincronización completada',
          mediaType: 1,
          thumbnailUrl: 'https://files.catbox.moe/t6bwzk.jpg',
          sourceUrl: 'https://github.com/CrizZapp/DekuBotMD'
        }
      }
    }, { quoted: m })

    if (!messager.includes('actualizado')) {
       setTimeout(() => { process.exit(0) }, 3000)
    }

  } catch (error) {
    // Si falla el pull por la rama, forzamos el reset
    try {
        execSync('git fetch origin master')
        execSync('git reset --hard origin/master')
        await m.reply('✅ *Update forzado mediante Reset (Limpieza profunda).*')
        setTimeout(() => { process.exit(0) }, 3000)
    } catch (err2) {
        await m.reply('❌ *Error:* ' + error.message)
    }
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix']
handler.rowner = true 

export default handler
