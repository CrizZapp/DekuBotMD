import { execSync } from 'child_process'
import chalk from 'chalk'

var handler = async (m, { conn, text }) => {
  // Usamos el check de owner que ya tienes o por jid
  await m.react('⏳')
  
  try {
    // 1. Configuramos el directorio como seguro dinámicamente (usa el directorio actual)
    execSync(`git config --global --add safe.directory ${process.cwd()}`)

    // 2. Intentamos el pull directamente
    const stdout = execSync('git pull' + (text ? ' ' + text : ''))
    let messager = stdout.toString()

    // Personalización de mensajes estilo Deku
    if (messager.includes('Already up to date') || messager.includes('Ya está al día')) {
      messager = '✅ *DekuBot MD ya está actualizado a la última versión.*'
    } else {
      messager = '🚀 *Actualización exitosa:*\n\n' + stdout.toString()
    }

    await m.react('✅')
    await conn.sendMessage(m.chat, {
      text: messager,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: 'DEKU BOT MD - UPDATE SYSTEM',
          body: 'Sincronizando con GitHub...',
          mediaType: 1,
          thumbnailUrl: 'https://files.catbox.moe/t6bwzk.jpg', // Puedes usar el de tu bot
          sourceUrl: 'https://github.com/CrizZapp/DekuBotMD'
        }
      }
    }, { quoted: m })

    // Reiniciar si hubo cambios reales
    if (!messager.includes('actualizado')) {
       setTimeout(() => { process.exit(0) }, 3000)
    }

  } catch (error) {
    // 3. Manejo de conflictos (Lógica Shadow mejorada)
    try {
      const status = execSync('git status --porcelain')
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            // Ignoramos archivos que siempre cambian
            if (/database\.json|session\/|tmp\/|node_modules/g.test(line)) return null
            return '*→ ' + line.slice(3) + '*'
          })
          .filter(Boolean)

        if (conflictedFiles.length > 0) {
          const errorMessage = `\`⚠︎ CONFLICTO DE DATOS:\`\n\n> *Se han modificado archivos locales que impiden la actualización automática. Por favor, revierte los cambios en:*\n\n${conflictedFiles.join('\n')}`
          
          await conn.sendMessage(m.chat, { text: errorMessage }, { quoted: m })
          return await m.react('✖️')
        }
      }
      
      // Si el error no es por conflictos, puede ser que no haya repo
      if (error.message.includes('not a git repository')) {
          await m.reply('❌ *Error:* El bot no fue instalado vía Git (clonado). No se puede actualizar automáticamente.')
      } else {
          await m.reply('❌ *Error inesperado:* ' + error.message)
      }

    } catch (err2) {
      console.error(err2)
      await m.reply('⚠︎ Error crítico en el sistema de actualización.')
    }
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix']
handler.rowner = true 

export default handler
