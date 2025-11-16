// script.js - WetonLogic (diperluas)
// -------------------- KONFIG --------------------
const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"]; // urutan 0–4
const PASARAN_NEPTU = { Legi:5, Pahing:9, Pon:7, Wage:4, Kliwon:8 };

const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const HARI_NEPTU = { Minggu:5, Senin:4, Selasa:3, Rabu:7, Kamis:8, Jumat:6, Sabtu:9 };

// Primbon reference: 1900-01-01 = Pahing (index 1)
let referenceDate = new Date(Date.UTC(1900,0,1));
let referencePasaranIndex = 1; // Pahing

// -------------------- UTIL --------------------
function toUTC(d){
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((toUTC(b) - toUTC(a)) / ms);
}

// pasaranIndex menggunakan ref date (sesuai skrip awal yang kamu kirim)
function pasaranIndex(date){
  let d = (typeof date === "string") ? new Date(date) : date;
  let selisih = daysBetween(referenceDate, d);
  return (referencePasaranIndex + ((selisih % 5) + 5)) % 5;
}
function getPasaran(date){ return PASARAN[ pasaranIndex(date) ]; }
function getHari(date){
  let d = (typeof date === "string") ? new Date(date) : date;
  return HARI[d.getDay()];
}
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

// -------------------- TAFSIR & PRIMBON (ringkasan) --------------------
// Ringkasan tafsir berdasarkan total neptu (diambil/diringkas dari primbon umum)
function tafsirByTotalNeptu(total){
  if(total <= 10) return "Kepribadian cenderung tenang, sabar, dan bekerja keras. Cocok menjadi pendengar dan pembawa damai.";
  if(total <= 13) return "Sifat menawan, ramah, namun kadang ragu. Perlu konsistensi dalam pilihan hidup.";
  if(total <= 16) return "Kuat, pekerja keras, berkemauan tinggi; cenderung penuh tanggung jawab.";
  if(total <= 18) return "Bersifat bijak & berhati-hati. Potensi rezeki baik jika dikelola.";
  return "Karakter kuat, pintar mengambil peluang, namun harus hati-hati terhadap konflik sosial.";
}

// ringkasan 6 petung perjodohan (sederhana) — versi ringkasan dari primbon Betaljemur (lihat primbon.com)
function petungPerjodohan(total1, total2){
  const sum = total1 + total2;
  const sisa7 = sum % 7;
  const sisa9 = sum % 9;
  // hasil ringkasan: kita tampilkan sisa mod7 dan mod9 serta interpretasi singkat
  const tafsir = {
    0: "Lebu Ketiup Angin: Kehidupan dinamis; perlu adaptasi.",
    1: "Wasesa Segara: Hubungan harmonis dan penuh dukungan.",
    2: "Tunggak Semi: Rejeki melimpah bila dijaga.",
    3: "Satria Wibawa: Dihormati, kehidupan cenderung mulia.",
    4: "Sumur Sinaba: Bijaksana, penuh kebijaksanaan keluarga.",
    5: "Lungguh / Satria Wirang: Perlu kehati-hatian; jika dijaga, kuat.",
    6: "Padu: Potensi konflik; komunikasi & kompromi penting."
  };
  return { sum, sisa7, sisa9, short: tafsir[sisa7] || '' };
}

// -------------------- DOM & INTERAKSI --------------------
const el = id => document.getElementById(id);

function updateShareLinkForPair(nama1, tgl1, nama2, tgl2){
  const params = new URLSearchParams();
  if(nama1) params.set('n1', nama1);
  if(tgl1) params.set('d1', tgl1);
  if(nama2) params.set('n2', nama2);
  if(tgl2) params.set('d2', tgl2);
  const link = window.location.origin + window.location.pathname + '?' + params.toString();
  el('share-link').value = link;
}

function salinLink(){
  const inp = el('share-link');
  if(!inp.value) return alert('Belum ada link untuk disalin.');
  inp.select();
  document.execCommand('copy');
  alert('Link hasil disalin ke clipboard');
}

function renderSummary(n1, d1, n2, d2, w1, w2){
  const s = [];
  s.push(`<div><strong>${escapeHtml(n1)}</strong><br><em>Tgl. Lahir: ${w1.hari} ${w1.pasaran}, ${formatDateHuman(d1)}</em></div>`);
  s.push(`<div style="margin-top:10px"><strong>${escapeHtml(n2)}</strong><br><em>Tgl. Lahir: ${w2.hari} ${w2.pasaran}, ${formatDateHuman(d2)}</em></div>`);
  return s.join('');
}

function renderDetail(w1, w2){
  const total1 = w1.totalNeptu, total2 = w2.totalNeptu;
  const sum = total1 + total2;
  const pet = petungPerjodohan(total1, total2);
  const tafsirShort = tafsirByTotalNeptu(Math.round((total1+total2)/2));
  return `
    <div class="petung-summary">
      <p><strong>Neptu ${escapeHtml(w1.hari)} ${escapeHtml(w1.pasaran)}:</strong> ${total1} &nbsp; <strong>Neptu ${escapeHtml(w2.hari)} ${escapeHtml(w2.pasaran)}:</strong> ${total2}</p>
      <p><strong>Total Neptu:</strong> ${sum} &nbsp; <strong>Sisa (mod 7):</strong> ${pet.sisa7}</p>
      <p style="font-weight:700;margin-top:8px">Interpretasi singkat: <span style="text-decoration:underline">${escapeHtml(pet.short)}</span></p>
      <p style="margin-top:10px">${escapeHtml(tafsirShort)}</p>
    </div>
  `;
}

function hitungRamalan(){
  const n1 = el('nama').value.trim() || 'Anda';
  const d1 = el('tanggal').value;
  const n2 = el('nama2').value.trim() || 'Pasangan';
  const d2 = el('tanggal2').value;
  if(!d1 || !d2){ alert('Harap isi tanggal lahir kedua pihak.'); return; }

  const w1 = getWeton(new Date(d1 + 'T00:00:00'));
  const w2 = getWeton(new Date(d2 + 'T00:00:00'));

  el('summary').innerHTML = renderSummary(n1, d1, n2, d2, w1, w2);
  el('detail').innerHTML = renderDetail(w1, w2);

  el('result').hidden = false;
  updateShareLinkForPair(n1, d1, n2, d2);
  simpanRiwayat(n1 + ' & ' + n2, `${d1} + ${d2}`, {w1,w2});
  window.location.hash = '#result';
}

// -------------------- TABEL 35 WETON (interaktif) --------------------
function buildWetonTable(){
  const tbody = document.querySelector('#wetonTable tbody');
  tbody.innerHTML = '';
  for(let hi=0; hi<7; hi++){
    for(let pi=0; pi<5; pi++){
      const hari = HARI[hi];
      // to create a date that has this hari & pasaran combination we need to search forward from a known date.
      // We'll find the next date in year 2000 that matches both day-of-week and pasaran index to compute neptu (only for table; not authoritative date)
      // Simpler: compute neptu from mappings directly
      const pasaran = PASARAN[pi];
      const neptu = HARI_NEPTU[hari] + PASARAN_NEPTU[pasaran];
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${hari}</td><td>${pasaran}</td><td>${neptu}</td><td>${tafsirByTotalNeptu(neptu)}</td>`;
      // click to show a modal/detail (we'll simply populate result area with this weton detail)
      tr.addEventListener('click', ()=> {
        el('summary').innerHTML = `<strong>${hari} ${pasaran}</strong><br><em>Neptu: ${neptu}</em>`;
        el('detail').innerHTML = `<p>${escapeHtml(tafsirByTotalNeptu(neptu))}</p>`;
        el('result').hidden = false;
        el('share-link').value = ''; // no share for single weton by default
        window.location.hash = '#result';
      });
      tbody.appendChild(tr);
    }
  }
}

// -------------------- RIWAYAT --------------------
function simpanRiwayat(nama, tanggal, hasil){
  let riwayat = JSON.parse(localStorage.getItem("wetonHistory") || "[]");
  riwayat.unshift({ nama, tanggal, hasil, ts: Date.now() });
  localStorage.setItem("wetonHistory", JSON.stringify(riwayat.slice(0,30)));
  tampilkanRiwayat();
}
function tampilkanRiwayat(){
  let container = el('riwayat-list');
  let riwayat = JSON.parse(localStorage.getItem("wetonHistory") || "[]");
  container.innerHTML = "";
  riwayat.slice(0,10).forEach(r => {
    const div = document.createElement('div');
    div.className = 'riwayat-item';
    div.innerHTML = `<strong>${escapeHtml(r.nama)}</strong><div style="font-size:13px;color:var(--muted)">${escapeHtml(r.tanggal)}</div>`;
    container.appendChild(div);
  });
}

// -------------------- SHARE VIA URL (load) --------------------
function loadFromURL(){
  const p = new URLSearchParams(window.location.search);
  const n1 = p.get('n1') || p.get('nama');
  const d1 = p.get('d1') || p.get('tgl');
  const n2 = p.get('n2');
  const d2 = p.get('d2');

  if(n1) el('nama').value = n1;
  if(d1) el('tanggal').value = d1;
  if(n2) el('nama2').value = n2;
  if(d2) el('tanggal2').value = d2;

  if(d1 && d2) {
    // auto-calc if both dates exist
    setTimeout(()=> hitungRamalan(), 300);
  }
}

// -------------------- THEME --------------------
const toggleThemeBtn = el('toggleTheme');
function setThemeDark(v){
  if(v){
    document.documentElement.setAttribute('data-theme','dark');
    toggleThemeBtn.textContent = 'Light Mode';
    toggleThemeBtn.setAttribute('aria-pressed','true');
    localStorage.setItem('wl_theme','dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    toggleThemeBtn.textContent = 'Dark Mode';
    toggleThemeBtn.setAttribute('aria-pressed','false');
    localStorage.removeItem('wl_theme');
  }
}
toggleThemeBtn.addEventListener('click', ()=> setThemeDark(document.documentElement.getAttribute('data-theme') !== 'dark'));
(function(){
  if(localStorage.getItem('wl_theme') === 'dark') setThemeDark(true);
})();

// -------------------- HELPERS --------------------
function formatDateHuman(d){
  try {
    const D = new Date(d);
    return D.toLocaleDateString('id-ID', {year:'numeric', month:'long', day:'numeric'});
  } catch(e){ return d; }
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// -------------------- EVENTS --------------------
el('calcBtn').addEventListener('click', hitungRamalan);
el('resetBtn').addEventListener('click', ()=>{
  el('nama').value=''; el('tanggal').value=''; el('nama2').value=''; el('tanggal2').value='';
  el('result').hidden = true;
});
el('copyLinkBtn').addEventListener('click', salinLink);

// -------------------- INIT --------------------
window.onload = function(){
  tampilkanRiwayat();
  buildWetonTable();
  loadFromURL();
};
