import { execSync } from 'child_process'
import chalk from 'chalk'

var handler = async (m, { conn, from, text }) => {
  // Reacción manual ya que tu handler no tiene m.react
  await conn.sendMessage(from, { react: { text: "⏳", key: m.key } })
  
    try {
    execSync(`git config --global --add safe.directory ${process.cwd()}`)

    // 1. Forzamos a git a olvidar cualquier cambio local y sincronizar con el servidor
    // Esto soluciona el error de "Cambios locales detectados" de forma automática
    execSync('git fetch --all')
    execSync('git reset --hard origin/master') 
    
    // Si usas una rama distinta a master (ej: main), cámbiala arriba
    const stdout = execSync('git pull')
    let messager = stdout.toString()

    if (messager.includes('Already up to date') || messager.includes('Ya está al día')) {
      messager = '✅ *El sistema ya se encuentra en su última versión.*'
    } else {
      messager = '🚀 *Sincronización forzada exitosa:*\n\n' + stdout.toString()
    }

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
    try {
      const status = execSync('git status --porcelain')
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (/database\.json|session\/|tmp\/|node_modules/g.test(line)) return null
            return '*→ ' + line.slice(3) + '*'
          })
          .filter(Boolean)

        if (conflictedFiles.length > 0) {
          const errorMessage = `\`⚠︎ CONFLICTO:\`\n\n> *Cambios locales detectados. Revierte estos archivos:*\n\n${conflictedFiles.join('\n')}`
          await m.reply(errorMessage)
          return await conn.sendMessage(from, { react: { text: "✖️", key: m.key } })
        }
      }
      
      await m.reply('❌ *Error:* ' + error.message)

    } catch (err2) {
      await m.reply('⚠︎ Error crítico en el sistema.')
    }
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix']
handler.rowner = true 

export default handler
