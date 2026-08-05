// ==========================================================================
// YVOLKA ROLE SERVER
// Tugasnya cuma satu: dikasih Discord ID seorang user, dia nanya ke Discord
// "user ini role Discord-nya apa di server kita?", terus dicocokkan ke salah
// satu dari 3 kategori: developer / artist / creator.
//
// Ini HARUS jadi backend terpisah (bukan taruh di main.js) karena butuh
// DISCORD_BOT_TOKEN yang rahasia — kalau ditaruh di kode frontend, siapa
// saja yang buka DevTools bisa mencurinya dan mengontrol bot Discord kamu.
// ==========================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const {
  DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID,
  ROLE_ID_DEVELOPER,
  ROLE_ID_ARTIST,
  ROLE_ID_CREATOR,
  ALLOWED_ORIGIN,
  PORT = 3000
} = process.env;

// Hanya izinkan website kamu yang boleh manggil API ini
app.use(cors({ origin: ALLOWED_ORIGIN || '*' }));

// Urutan prioritas kategori — kalau (secara tidak sengaja) seorang user
// punya lebih dari satu role kategori, yang pertama cocok yang dipakai.
const CATEGORY_ROLE_MAP = [
  { category: 'developer', roleId: ROLE_ID_DEVELOPER },
  { category: 'artist', roleId: ROLE_ID_ARTIST },
  { category: 'creator', roleId: ROLE_ID_CREATOR }
];

app.get('/api/role/:discordId', async (req, res) => {
  const { discordId } = req.params;

  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    return res.status(500).json({
      error: 'Server belum dikonfigurasi. Isi DISCORD_BOT_TOKEN dan DISCORD_GUILD_ID di file .env.'
    });
  }

  try {
    const discordRes = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );

    // User login via Discord tapi belum join server YVOLKA
    if (discordRes.status === 404) {
      return res.json({ inGuild: false, role: null });
    }

    if (!discordRes.ok) {
      console.error('Discord API error:', discordRes.status, await discordRes.text());
      return res.status(502).json({ error: 'Gagal mengambil data dari Discord', status: discordRes.status });
    }

    const member = await discordRes.json();
    const memberRoleIds = member.roles || [];

    const match = CATEGORY_ROLE_MAP.find(c => c.roleId && memberRoleIds.includes(c.roleId));

    return res.json({ inGuild: true, role: match ? match.category : null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Tidak bisa menghubungi Discord API' });
  }
});

app.get('/', (req, res) => res.send('YVOLKA role server is running.'));

app.listen(PORT, () => console.log(`YVOLKA role server jalan di port ${PORT}`));
