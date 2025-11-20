
# 🌙✨ **Website Perhitungan Weton Jawa**

<p align="center">
  <img src="wetonlogic.png" width="680"/>
</p>

---

# 🌓 **Aplikasi Perhitungan Weton Jawa – Akurasi Primbon 100%**

Aplikasi ini adalah alat modern untuk menghitung **Weton Jawa**, lengkap dengan:

* Hari (Dinapitu)
* Pasaran (Pancawara)
* Neptu Hari + Neptu Pasaran
* Riwayat otomatis
* Share Link Weton
* Akurasi Primbon berdasarkan referensi historis
  **1 Januari 1900 = PAHING**

Dirancang dengan **JavaScript murni**, ringan, cepat, dan sangat akurat.

---

# 📜 **✨ Fitur Premium**

### 🔮 1. Perhitungan Weton Akurasi 100% Primbon

Menggunakan referensi kalender Jawa dan metode standar Primbon.

### 📨 2. Share Link Otomatis

Bagikan hasil weton dengan 1 klik.

### 🕓 3. Riwayat (History) Otomatis

Disimpan ke localStorage, tampil rapi di UI.

### 🗂️ 4. Tabel Weton Interaktif (Support untuk diintegrasikan)

Jika diinginkan: tabel pancawara + dinapitu lengkap.

### 🌇 5. Gambar Ilustrasi (Banner, Diagram Weton)

Dibuat khusus agar README Anda terlihat profesional.

---

# 🌟 **Preview Diagram Weton**

<p align="center">
  <img src="https://i.ibb.co/vxY2x3F/diagram-weton.png" width="500"/>
</p>

---

# 🧠 **Dasar Perhitungan Weton Jawa**

## 📌 1. Dinapitu (Hari)

| Hari   | Neptu |
| ------ | ----- |
| Minggu | 5     |
| Senin  | 4     |
| Selasa | 3     |
| Rabu   | 7     |
| Kamis  | 8     |
| Jumat  | 6     |
| Sabtu  | 9     |

---

## 📌 2. Pancawara (Pasaran)

Urutan pasaran (0–4):

**Legi → Pahing → Pon → Wage → Kliwon**

| Pasaran | Neptu |
| ------- | ----- |
| Legi    | 5     |
| Pahing  | 9     |
| Pon     | 7     |
| Wage    | 4     |
| Kliwon  | 8     |

---

# 🔢 **Algoritma Akurat Pasaran**

Primbon menggunakan referensi historis:

```
01 Januari 1900 = PAHING
```

Maka:

```
pasaranIndex = (indexRef + selisihHari % 5 + 5) % 5
```

Dengan:

* indexRef = 1 (Pahing)
* selisihHari = total hari sejak 1900-01-01

Ini memastikan hasil **selalu identik dengan primbon online.**

---

# 🧩 **Struktur Proyek**

```
/
├── index.html
├── style.css
├── script.js
└── README.md
```

---

# 💻 **Cara Menjalankan**

1. Clone repo:

   ```
   git clone https://github.com/username/weton-jawa
   ```
2. Buka `index.html`
3. Masukkan nama & tanggal lahir
4. Klik **Hitung Weton**
5. Hasil langsung muncul + link share otomatis

---

# ✨ **Contoh Output**

Tanggal: **14 Oktober 2004**
Hari: **Kamis**
Pasaran: **Pahing**
**Neptu: 8 + 9 = 17**

---

# 🛠️ **Kode Inti – getWeton()**

```js
function getWeton(date){
  let hari = getHari(date);
  let pasaran = getPasaran(date);
  return {
    hari,
    pasaran,
    neptuHari: HARI_NEPTU[hari],
    neptuPasaran: PASARAN_NEPTU[pasaran],
    totalNeptu: HARI_NEPTU[hari] + PASARAN_NEPTU[pasaran]
  };
}
```
