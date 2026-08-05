# YVOLKA Role Server

Backend kecil pakai Node.js + Express. Tugasnya: dikasih Discord ID seorang
user, dia cek role Discord user itu di server YVOLKA, terus kasih tahu
frontend kategori dia — Developer, Artist, atau Creator. Tidak ada login
manual pilih kategori lagi; semuanya dibaca dari role Discord.

## 1. Bikin Bot Discord

1. Buka https://discord.com/developers/applications
2. Pilih aplikasi YVOLKA yang sudah kamu buat (yang dipakai untuk OAuth login), atau buat baru.
3. Ke tab **Bot** → klik **Add Bot** kalau belum ada.
4. Klik **Reset Token**, salin token-nya → ini nilai `DISCORD_BOT_TOKEN`.
5. Undang bot itu ke server YVOLKA kamu: tab **OAuth2 → URL Generator**,
   centang scope `bot`, permission minimal **View Channels** / **View Server Members**
   sudah cukup untuk fitur ini. Buka URL yang dihasilkan, pilih server kamu, invite.

## 2. Ambil ID yang dibutuhkan

Aktifkan dulu Developer Mode di Discord (Settings → Advanced → Developer Mode).

- **DISCORD_GUILD_ID** — klik kanan nama server → Copy Server ID
- **ROLE_ID_DEVELOPER / ARTIST / CREATOR** — Server Settings → Roles →
  klik kanan tiap role → Copy Role ID

## 3. Setup & jalankan

```bash
cd server
cp .env.example .env
# lalu isi semua nilai di .env
npm install
npm start
```

Server akan jalan di `http://localhost:3000` (atau sesuai `PORT`). Tes:

```
GET http://localhost:3000/api/role/123456789012345678
```

Balasannya salah satu dari:

```json
{ "inGuild": true, "role": "developer" }
{ "inGuild": true, "role": null }      // ada di server, tapi belum dikasih role kategori
{ "inGuild": false, "role": null }     // belum join server YVOLKA
```

## 4. Deploy

Hosting gratis yang gampang buat backend kecil begini: **Render**, **Railway**,
atau **Fly.io**. Intinya: upload folder `server/` ini, set environment
variables sesuai `.env.example` di dashboard hosting-nya, deploy.

Setelah dapat URL publiknya (misal `https://yvolka-role-server.onrender.com`),
buka `main.js` di frontend dan isi:

```js
const ROLE_SERVER_URL = 'https://yvolka-role-server.onrender.com';
```

## 5. Catatan

- Kategori otomatis ke-refresh tiap kali user login ulang / buka lagi
  websitenya — jadi kalau kamu ganti role Discord seseorang, dashboard
  mereka otomatis ikut berubah tanpa perlu login ulang manual.
- User yang login pakai **nickname** (bukan Discord OAuth asli) tidak akan
  dapat kategori, karena sistem tidak bisa memverifikasi role Discord
  mereka sungguhan.
