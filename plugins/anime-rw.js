import { promises as fs } from 'fs';
import fetch from 'node-fetch';

async function obtenerImagen(tags) {
  if (!tags || tags.length === 0) return null;
  const q = String(tags[0]).trim().toLowerCase().replace(/\s+/g, '_');
  const sites = [
    `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${q}`,
    `https://danbooru.donmai.us/posts.json?tags=${q}`
  ];
  for (const url of sites) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.post || [];
      const image = items.find(img => img.file_url || img.large_file_url);
      if (image) return image.file_url || image.large_file_url;
    } catch { continue; }
  }
  return null;
}

const handler = async (m, { conn, from, usedPrefix }) => {
  try {
    const data = await fs.readFile("./lib/characters.json", "utf-8");
    const dbChars = JSON.parse(data);
    const allChars = Object.values(dbChars).flatMap(x => (x && Array.isArray(x.characters)) ? x.characters : []);

    if (allChars.length === 0) return conn.sendMessage(from, { text: "❌ JSON vacío." }, { quoted: m });

    const char = allChars[Math.floor(Math.random() * allChars.length)];
    const serie = Object.values(dbChars).find(s => s.characters?.some(c => String(c.id) === String(char.id)))?.name || "Desconocida";

    let imagen = char.image || char.media || await obtenerImagen(char.tags) || "https://th.bing.com/th/id/OIP.Xp_9SOnuB4lU6_C697-AtQHaHa?pid=ImgDet&rs=1";

    const caption = `❀ *ᴘᴇʀsᴏɴᴀᴊᴇ:* ${char.name}
⚥ *ɢᴇ́ɴᴇʀᴏ:* ${char.gender || 'Desconocido'}
✰ *ᴠᴀʟᴏʀ:* ${char.value || 100}
❖ *sᴇʀɪᴇ:* ${serie}

`.trim();

    await conn.sendMessage(from, { image: { url: imagen }, caption }, { quoted: m });

  } catch (e) {
    console.error(e);
    conn.sendMessage(from, { text: "❌ Error: " + e.message }, { quoted: m });
  }
};

handler.help = ['rw', 'roll'];
handler.tags = ['anime'];
handler.command = ['rw', 'roll'];
handler.group = true;

export default handler;
