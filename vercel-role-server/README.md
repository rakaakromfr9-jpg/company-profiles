# YVOLKA Role Server (Vercel version)

Versi ini gak perlu kartu kredit sama sekali buat deploy. Fungsinya sama
seperti versi Express di folder `/server`: baca role Discord user di server
YVOLKA, balikin kategorinya (`developer` / `artist` / `creator`).

## Kenapa strukturnya beda dari versi Express?

Vercel jalanin kode kamu sebagai **serverless function** — bukan server yang
nyala terus, tapi kode yang "dibangunkan" tiap ada request masuk, terus
tidur lagi. Buat kebutuhan kita (cuma jawab pertanyaan "role user ini apa?"),
ini lebih dari cukup dan gratis tanpa batas waktu tidur kayak Render.

## 1. Bikin bot Discord & ambil ID-ID yang dibutuhkan

Sama seperti versi Express — ikuti langkah di `/server/README.md` bagian
1 dan 2 (bikin bot, invite ke server, ambil Guild ID & Role ID).

## 2. Upload folder ini ke GitHub

Folder `vercel-role-server/` ini upload sebagai repo baru di GitHub (terpisah
dari repo `company-profiles` juga boleh, atau taruh sebagai folder di repo
yang sama — nanti tinggal atur "Root Directory" pas import ke Vercel).

## 3. Deploy ke Vercel (tanpa kartu kredit)

1. Buka **vercel.com** → **Sign Up** → pilih **Continue with GitHub**
2. Di dashboard, klik **Add New...** → **Project**
3. Pilih repo yang berisi folder `vercel-role-server/` ini
4. Kalau folder ini bukan root repo, isi **Root Directory** dengan
   `vercel-role-server`
5. Framework Preset biarkan **Other** — Vercel otomatis mengenali folder
   `api/` sebagai serverless functions, gak perlu build command apa-apa
6. Sebelum klik Deploy, buka bagian **Environment Variables**, isi:

   ```
   DISCORD_BOT_TOKEN=...
   DISCORD_GUILD_ID=...
   ROLE_ID_DEVELOPER=...
   ROLE_ID_ARTIST=...
   ROLE_ID_CREATOR=...
   ALLOWED_ORIGIN=https://rakaakromfr9-jpg.github.io
   ```

7. Klik **Deploy**. Tunggu ± 30 detik.

Kamu akan dapat URL kayak:

```
https://yvolka-role-server.vercel.app
```

## 4. Tes

Buka di browser:

```
https://yvolka-role-server.vercel.app/api/role/DISCORD_ID_KAMU
```

Harus keluar JSON seperti `{"inGuild":true,"role":"developer"}`.

## 5. Sambungkan ke frontend

Buka `main.js` di project YVOLKA utama, isi:

```js
const ROLE_SERVER_URL = 'https://yvolka-role-server.vercel.app';
```

Push perubahan itu ke GitHub Pages kamu. Selesai — nggak ada kartu kredit
yang perlu diisi di mana pun dalam proses ini.

## Catatan

- Kalau nanti ganti Environment Variables di dashboard Vercel, kamu perlu
  klik **Redeploy** sekali biar perubahannya kepakai.
- Free tier Vercel gak punya masalah "server tidur" kayak Render, karena
  memang bukan server yang nyala terus — jadi responnya konsisten cepat.
