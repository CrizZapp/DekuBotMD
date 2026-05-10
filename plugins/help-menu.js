import fs from 'fs'

const handler = async (m, { conn, from, sender, usedPrefix }) => {
  try {

    const saludo = saludoPorHora()

    const videoBuffer = fs.readFileSync("./menu.mp4")
    const thumb = fs.readFileSync("./image.jpg")

    const totalCommands = Object.keys(global.plugins).length
    const readMore = String.fromCharCode(8206).repeat(4001)

    let tags = {
      main: '🏠 ᴜᴛɪʟᴇꜱ',
      anime: '🌸 ᴀɴɪᴍᴇ / ᴍᴀɴɢᴀ',
      descargas: '📥 ᴅᴏᴡɴʟᴏᴀᴅꜱ',
      grupos: '👥 ɢʀᴜᴘᴏꜱ',
      tools: '🛠️ ᴛᴏᴏʟꜱ',
      sticker: '🎭 ꜱᴛɪᴄᴋᴇʀꜱ',
      owner: '🛡️ ᴏᴡɴᴇʀ ᴛᴏᴏʟꜱ',
    }

    let commands = Object.values(global.plugins)
      .filter(v => v.help && v.tags)
      .map(v => ({
        help: Array.isArray(v.help) ? v.help : [v.help],
        tags: Array.isArray(v.tags) ? v.tags : [v.tags]
      }))

    let menuTexto = `
> 📗 *${saludo},* @${sender.split("@")[0]}

> ☀️ \`ɪ ɴ ғ ᴏ - ᴅᴇᴋᴜ ʙᴏᴛ ᴍᴅ\`
> ✧ *ᴄᴏᴍᴀɴᴅᴏꜱ ›* ${totalCommands}
> ✧ *ᴇꜱᴛᴀᴅᴏ ›* Activo 

${readMore}

⚡ *ᴀɴᴀʟɪꜱɪꜱ ᴅᴇ ʜᴀʙɪʟɪᴅᴀᴅᴇꜱ* ⚡
`.trim()

    for (let tag in tags) {

      let comandos = commands
        .filter(cmd => cmd.tags.includes(tag))
        .map(cmd =>
          cmd.help.map(e => `│ ⚡ *${usedPrefix}${e}*`).join('\n')
        )
        .join('\n')

      if (comandos) {
        menuTexto += `

┌── [ *${tags[tag]}* ]
${comandos}
└──────────┈`
      }
    }

    await conn.sendMessage(from, {

      video: videoBuffer,
      caption: menuTexto,
      gifPlayback: true,
      mentions: [sender],

      contextInfo: {

        isForwarded: true,
        forwardingScore: 1,

        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363410297956678@newsletter",
          newsletterName: "🜸 图书馆  - ɑᥣᥣᥱᥒ ✿",
          serverMessageId: 1
        },

        externalAdReply: {
          title: "📗 ᴅᴇᴋᴜ ʙᴏᴛ ᴍᴅ",
          body: "ᴀɴᴀʟɪꜱɪꜱ ᴅᴇ ʜᴀʙɪʟɪᴅᴀᴅᴇꜱ",
          thumbnail: thumb,
          sourceUrl: "https://github.com/DekuBotMD",
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }

      }

    }, { quoted: m })

    await conn.sendMessage(from, {
      react: {
        text: "💚",
        key: m.key
      }
    })

  } catch (e) {

    console.error(e)

    m.reply(
      "❌ Error: Verifica que existan menu.mp4 e image.jpg"
    )
  }
}

handler.help = ['menu', 'help']
handler.tags = ['main']
handler.command = ['menu', 'help', 'comandos']

export default handler

function saludoPorHora() {

  const hora = new Date().getHours()

  if (hora >= 5 && hora < 12)
    return "Buenos días"

  if (hora >= 12 && hora < 19)
    return "Buenas tardes"

  return "Buenas noches"
}
