import yts from "yt-search"
import fetch from "node-fetch"

const handler = async (m, { conn, from, usedPrefix, command, args }) => {
  
  let text = args.join(" ")
  let q = text ? text : m.quoted?.text || "";
  
  if (!q) return conn.sendMessage(from, { 
    text: `⚡ *¡Héroe, necesitas darme un nombre!*\n\nEjemplo: _${usedPrefix + command} Rewrite the Stars_` 
  }, { quoted: m })

  try {

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    let res = await yts(q)
    if (!res?.videos?.length) return conn.sendMessage(from, { text: "🚫 No logré encontrar esa pista." }, { quoted: m })
    
    let video = res.videos[0]
    let { title, author, timestamp, views, url, thumbnail } = video

    const caption = `
┌─ [ ⚡ ᴀɴᴀʟɪꜱɪꜱ ᴅᴇ ᴀᴜᴅɪᴏ⚡ ]
│ 🎼 *ᴛɪᴛᴜʟᴏ:* ${title}
│ 📺 *ᴄᴀɴᴀʟ:* ${author.name}
│ ⏳ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}
│ 🌐 *ᴇɴʟᴀᴄᴇ:* ${url}
└───────────┈ 

> *ᴅᴇᴋᴜ ʙᴏᴛ ᴍᴅ* descargando espera un poco ¡No soy flash!...`.trim()



    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: caption
    }, { quoted: m })


    const apiUrl = `https://api-gohan.onrender.com/download/ytaudio?url=${encodeURIComponent(url)}`
    const r = await fetch(apiUrl)
    const data = await r.json()

    if (data?.status && data?.result?.download_url) {
      await conn.sendMessage(from, {
        audio: { url: data.result.download_url },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        ptt: false
      }, { quoted: m })
      
      await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    } else {
      await conn.sendMessage(from, { text: "⚠️ La API no respondió correctamente." }, { quoted: m })
    }

  } catch (e) {
    console.error(e)

    await conn.sendMessage(m.key.remoteJid, { text: "⚠️ *Hubo un fallo en el sistema.*" }, { quoted: m })
  }
}

handler.help = ['playaudio']
handler.tags = ['descargas']
handler.command = ['playaudio', 'mp3']

export default handler
