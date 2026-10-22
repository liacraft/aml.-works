# Setup penyimpanan form aml. works — GitHub Pages + Google Sheets + email

Website ini tetap memakai HTML, CSS, dan JavaScript biasa. Google Apps Script menjadi endpoint penerima form; Google Sheets menyimpan request dan Apps Script mengirim email notifikasi.

## 1. Buat Google Sheet
1. Buat Google Spreadsheet baru, misalnya `aml. works — Project Requests`.
2. Dari spreadsheet tersebut, pilih **Extensions → Apps Script**. Ini penting agar script terikat ke spreadsheet dan `getActiveSpreadsheet()` bisa menemukannya.
3. Hapus kode contoh lalu salin seluruh isi file `Code.gs` dari folder ini ke editor Apps Script.
4. Dari URL Google Sheet `https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit`, salin bagian `ID_SPREADSHEET` di antara `/d/` dan `/edit`, lalu tempel ke `SPREADSHEET_ID` pada `Code.gs`.
5. Ubah `YOUR_EMAIL@example.com` pada `NOTIFICATION_EMAIL` menjadi email kamu.
6. Klik Save.

## 2. Deploy endpoint
1. Di Apps Script, klik **Deploy → New deployment**.
2. Pilih tipe **Web app**.
3. Set **Execute as: Me**.
4. Set akses ke **Anyone** jika opsi ini tersedia dan sesuai kebijakan akun Google kamu. Ini memungkinkan pengunjung GitHub Pages mengirim form tanpa login. Jangan gunakan ini jika kebijakan akun kantor melarang deployment publik.
5. Klik Deploy dan selesaikan otorisasi Google. Salin URL Web app yang berakhir dengan `/exec`.
6. Jika kamu mengubah kode Apps Script di masa depan, buat versi deployment baru melalui **Deploy → Manage deployments → Edit → New version**.

## 3. Hubungkan website
1. Buka `app.js`.
2. Temukan `const GOOGLE_APPS_SCRIPT_URL = '';` di bagian atas.
3. Tempel URL `/exec` yang disalin, di antara tanda kutip. Contoh: `const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec';`
4. Simpan dan commit/push file ke GitHub Pages.

## 4. Uji sebelum dipublikasikan
1. Buka URL GitHub Pages kamu dan kirim satu request uji dengan data yang bukan rahasia.
2. Form akan membuka tab baru berisi status dari Apps Script.
3. Pastikan satu baris baru masuk ke tab `Project Requests` dan email notifikasi diterima. Periksa folder Spam jika perlu.
4. Jika gagal, cek Apps Script → **Executions** untuk melihat error. Pastikan `SPREADSHEET_ID` dan email sudah benar, izin telah diberikan, URL `/exec` benar, dan deployment terbaru sudah dipublikasikan.

## Yang perlu diketahui
- Integrasi belum aktif sampai langkah setup selesai dan URL dimasukkan ke `app.js`.
- GitHub Pages hanya menyajikan file statis; ia tidak menyimpan form ke database sendiri.
- URL Apps Script bersifat publik. Script memakai validasi field wajib dan honeypot sederhana, tetapi bukan proteksi spam tingkat lanjut. Jika spam menjadi masalah, tambahkan CAPTCHA atau gunakan layanan form dengan perlindungan spam.
- Jangan minta data sensitif dari pengunjung. Form ini hanya untuk kebutuhan brief project.
- Notifikasi email dikirim dari akun Google yang menjalankan Apps Script dan tunduk pada kuota Google Apps Script/MailApp.
