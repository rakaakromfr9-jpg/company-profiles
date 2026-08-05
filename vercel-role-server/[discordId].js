// ==========================================================================
// YVOLKA ROLE SERVER — Vercel serverless function version
// URL akhirnya nanti: https://nama-project-kamu.vercel.app/api/role/123456789
//
// Ini versi yang gak perlu kartu kredit buat deploy. Logikanya sama persis
// dengan versi Express di /server: dikasih Discord ID, dia tanya ke Discord
// role apa yang dipunya user itu di server YVOLKA, terus dicocokkan ke salah
// satu dari 3 kategori (developer/artist/creator).
// ==========================================================================

module.exports = async function handler(req, res) {
  const { discordId } = req.query;

  const {
    DISCORD_BOT_TOKEN,
    DISCORD_GUILD_ID,
    ROLE_ID_DEVELOPER,
    ROLE_ID_ARTIST,
    ROLE_ID_CREATOR,
    ALLOWED_ORIGIN
  } = process.env;

  // Cuma izinkan website kamu yang boleh manggil endpoint ini
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN || '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    return res.status(500).json({
      error: 'Server belum dikonfigurasi. Isi DISCORD_BOT_TOKEN & DISCORD_GUILD_ID di Vercel > Settings > Environment Variables.'
    });
  }

  if (!discordId) {
    return res.status(400).json({ error: 'Discord ID tidak ada di URL' });
  }

  // Urutan prioritas kategori — kalau (secara tidak sengaja) seorang user
  // punya lebih dari satu role kategori, yang pertama cocok yang dipakai.
  const CATEGORY_ROLE_MAP = [
    { category: 'developer', roleId: ROLE_ID_DEVELOPER },
    { category: 'artist', roleId: ROLE_ID_ARTIST },
    { category: 'creator', roleId: ROLE_ID_CREATOR }
  ];

  try {
    const discordRes = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );

    // User login via Discord tapi belum join server YVOLKA
    if (discordRes.status === 404) {
      return res.status(200).json({ inGuild: false, role: null });
    }

    if (!discordRes.ok) {
      console.error('Discord API error:', discordRes.status, await discordRes.text());
      return res.status(502).json({ error: 'Gagal mengambil data dari Discord', status: discordRes.status });
    }

    const member = await discordRes.json();
    const memberRoleIds = member.roles || [];

    const match = CATEGORY_ROLE_MAP.find(c => c.roleId && memberRoleIds.includes(c.roleId));

    return res.status(200).json({ inGuild: true, role: match ? match.category : null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Tidak bisa menghubungi Discord API' });
  }
};
