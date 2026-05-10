
const delay = ms => new Promise(res => setTimeout(res, ms))

const handler = async (m, { conn, from, usedPrefix }) => {
  try {
    let mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    
    if (!mentionedJid) {
      return m.reply(`[!] Error de sintaxis. Uso correcto: *${usedPrefix}dox @usuario*`)
    }

    let msg = await conn.sendMessage(from, { text: "Iniciando terminal..." }, { quoted: m })

    
    const frames = [
      "[!] Estableciendo conexión segura...\n[▱▱▱▱▱▱▱▱▱▱] 0%",
      "[➤] Interceptando tráfico de red...\n[▰▰▱▱▱▱▱▱▱▱] 20%",
      "[➤] Extrayendo metadatos del objetivo...\n[▰▰▰▰▱▱▱▱▱▱] 40%",
      "[➤] Vulnerando firewall perimetral...\n[▰▰▰▰▰▰▱▱▱▱] 60%",
      "[➤] Descifrando bases de datos locales...\n[▰▰▰▰▰▰▰▰▱▱] 80%",
      "[✓] Datos compilados con éxito.\n[▰▰▰▰▰▰▰▰▰▰] 100%"
    ]

    
    for (let frame of frames) {
      await delay(400) 
      await conn.sendMessage(from, { 
        text: frame, 
        edit: msg.key 
      })
    }

    await delay(400)


    const randomIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    const randomMac = () => "XX:XX:XX:XX:XX:XX".replace(/X/g, () => "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16)))
    const randomHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const lat = (Math.random() * 180 - 90).toFixed(4)
    const lon = (Math.random() * 360 - 180).toFixed(4)


    const doxReport = `
====================================
  ☠️ TARGET ACQUIRED: @${mentionedJid.split('@')[0]}
====================================

[📡] NETWORK & LOCATION
├ IPv4: ${randomIP()}
├ IPv6: 2001:0db8:${Math.floor(Math.random() * 9999)}:0000:0000:8a2e:0370:7334
├ MAC Address: ${randomMac()}
├ ISP: Telecom / Movistar / Claro (Dynamic)
└ Coordinates: ${lat}, ${lon}

[💻] DEVICE FINGERPRINT
├ OS Version: Android 13.0 / iOS 16.4
├ Status: Unrooted / Jailbreak: False
└ WhatsApp Build: 2.23.10.71

[📂] VULNERABILITY REPORT
├ Open Ports: 22(SSH), 80(HTTP), 443(HTTPS)
├ Leaked Email: user_${Math.floor(Math.random() * 9999)}@gmail.com
├ Pass Hash (MD5): ${randomHash()}
└ Status: [COMPROMISED]

====================================`

    
    await conn.sendMessage(from, { 
      text: doxReport.trim(), 
      edit: msg.key,
      mentions: [mentionedJid] 
    })

  } catch (e) {
    console.error(e)
    m.reply("[!] Error crítico en el sistema de recolección.")
  }
}

handler.help = ['dox <@user>']
handler.tags = ['tools'] 
handler.command = ['dox']

export default handler
