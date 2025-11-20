// ---------------- CONFIG ----------------
const PASARAN = ["Legi","Pahing","Pon","Wage","Kliwon"];
const PASARAN_NEPTU = { Legi:5, Pahing:9, Pon:7, Wage:4, Kliwon:8 };
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const HARI_NEPTU = { Minggu:5, Senin:4, Selasa:3, Rabu:7, Kamis:8, Jumat:6, Sabtu:9 };
let referenceDate = new Date(Date.UTC(1900,0,1));
let referencePasaranIndex = 1; // Pahing

// ---------------- Helpers ----------------
function toUTC(d){ return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); }
function daysBetween(a,b){ const ms = 24*60*60*1000; return Math.floor((toUTC(b) - toUTC(a))/ms); }
function pasaranIndex(date){ let d=(typeof date==='string')?new Date(date):date; let selisih = daysBetween(referenceDate, d); return (referencePasaranIndex + ((selisih%5)+5))%5; }
function getPasaran(date){ return PASARAN[ pasaranIndex(date) ]; }
function getHari(date){ let d=(typeof date==='string')?new Date(date):date; return HARI[d.getDay()]; }
function getWeton(date){ let hari=getHari(date); let pas=getPasaran(date); return { hari, pasaran:pas, neptuHari:HARI_NEPTU[hari], neptuPasaran:PASARAN_NEPTU[pas], totalNeptu:HARI_NEPTU[hari]+PASARAN_NEPTU[pas] }; }

// ---------------- Audio Player (built-in 5 gending) ----------------
const audioEl = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seek = document.getElementById('seek');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const playlistEl = document.getElementById('playlist');

let defaultTracks = [
  { title: 'IrengIreng', src: 'assets/gending/IrengIreng.mp3' },
  { title: 'kedanan', src: 'assets/gending/kedanan.mp3' },
  { title: 'KecikKecik', src: 'assets/gending/KecikKecik.mp3' },
  { title: 'ngamen4', src: 'assets/gending/ngamen4.mp3' },
  { title: 'PendekarRakyat', src: 'assets/gending/PendekarRakyat.mp3' }
];

let current = 0;
let playing = false;

function renderPlaylist(){
  playlistEl.innerHTML = '';
  defaultTracks.forEach((t,i)=>{
    const row = document.createElement('div');
    row.className = 'pls-item';
    row.innerHTML = `<span class="pls-title">${escapeHtml(t.title)}</span><button class="pls-play" data-i="${i}" title="Play"><i class="fas fa-play"></i></button>`;
    playlistEl.appendChild(row);
  });
  playlistEl.querySelectorAll('.pls-play').forEach(b=> b.addEventListener('click', ()=> loadTrack(Number(b.dataset.i))));
}

function loadTrack(i){
  if(i<0 || i>=defaultTracks.length) return;
  current = i;
  audioEl.src = defaultTracks[i].src;
  audioEl.load();
  audioEl.play().then(()=>{ playing=true; updatePlayBtn(); }).catch(()=>{});
  highlightCurrent();
}

function highlightCurrent(){
  const items = playlistEl.querySelectorAll('.pls-item');
  items.forEach((it,idx)=>{ it.style.opacity = idx===current? '1' : '0.66'; });
}

function updatePlayBtn(){ playBtn.innerHTML = playing? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>'; }

playBtn.addEventListener('click', ()=>{
  if(!audioEl.src){ loadTrack(0); return; }
  if(playing){ audioEl.pause(); playing=false; } else { audioEl.play(); playing=true; }
  updatePlayBtn();
});
prevBtn.addEventListener('click', ()=>{ loadTrack((current-1+defaultTracks.length)%defaultTracks.length); });
nextBtn.addEventListener('click', ()=>{ loadTrack((current+1)%defaultTracks.length); });

audioEl.addEventListener('timeupdate', ()=>{
  seek.max = audioEl.duration || 0; seek.value = audioEl.currentTime || 0; curTime.textContent = formatTime(audioEl.currentTime||0); durTime.textContent = formatTime(audioEl.duration||0);
});
audioEl.volume = 1.0;
seek.addEventListener('input', ()=>{ audioEl.currentTime = seek.value; });
audioEl.addEventListener('ended', ()=>{ playing=false; updatePlayBtn(); nextBtn.click(); });

function formatTime(t){ if(!t || isNaN(t)) return '00:00'; const m = Math.floor(t/60); const s = Math.floor(t%60); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }

// ---------------- WETON UI ----------------
const el = id => document.getElementById(id);
function updateShareLinkForPair(n1,d1,n2,d2){ const params = new URLSearchParams(); if(n1) params.set('n1', n1); if(d1) params.set('d1', d1); if(n2) params.set('n2', n2); if(d2) params.set('d2', d2); el('share-link').value = window.location.origin + window.location.pathname + '?' + params.toString(); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderSummary(n1,d1,n2,d2,w1,w2){ return `<div><strong>${escapeHtml(n1)}</strong><br><em>Tgl. Lahir: ${w1.hari} ${w1.pasaran}, ${formatDateHuman(d1)}</em></div><div style="margin-top:10px"><strong>${escapeHtml(n2)}</strong><br><em>Tgl. Lahir: ${w2.hari} ${w2.pasaran}, ${formatDateHuman(d2)}</em></div>`; }

function tafsirByTotalNeptu(total){ if(total<=10) return "Tenang, sabar; cocok membawa damai."; if(total<=13) return "Menawan, namun perlu konsistensi."; if(total<=16) return "Kuat dan bertanggung jawab."; if(total<=18) return "Bijak, potensi rezeki baik."; return "Karakter kuat; hati-hati konflik."; }
function petungPerjodohan(total1, total2){ const sum = total1+total2; const sisa7 = sum%7; const tafsir = {0:"Lebu Ketiup Angin:seseorang yang rezekinya mudah datang tetapi juga mudah hilang, mirip debu yang tertiup angin, sehingga sulit untuk menabung atau mencapai stabilitas finansial.",1:"Wasesa Segara: seseorang yang memiliki rezeki seluas samudra. Seseorang dengan watak ini dipercaya memiliki wawasan yang luas, kecerdasan, pengalaman yang mendalam, rezeki yang melimpah, dan jiwa kepemimpinan yang tinggi.",2:"Tunggak Semi: sifat orang yang memiliki ketahanan, mampu bangkit dari kesulitan, dan terus bertumbuh meskipun dalam kondisi sulit, seperti tunas baru yang tumbuh dari batang pohon yang sudah ditebang. ",3:"Satria Wibawa: seseorang yang kelak akan menjadi sosok yang dihormati dan disegani oleh orang-orang di sekitarnya, memiliki kewibawaan, dan sering dianggap sebagai panutan. ",4:"Sumur Sinaba: sosok seseorang yang bijaksana, cerdas, dan menjadi tempat bersandar bagi orang lain untuk meminta pertolongan atau nasihat, seperti sumur yang selalu didatangi orang untuk mengambil air. ",5:"Lungguh: seseorang berpotensi besar untuk meraih kedudukan tinggi, kehormatan, dan kekayaan.",6:"Padu: Pasangan dengan weton padu dipercaya akan mengalami banyak pertengkaran atau cekcok. "}; return {sum, sisa7, short:tafsir[sisa7]}; }

function formatDateHuman(d){ try{ const D = new Date(d); return D.toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'}); }catch(e){ return d; } }

function renderDetail(w1,w2){ const total1=w1.totalNeptu, total2=w2.totalNeptu; const sum=total1+total2; const pet=petungPerjodohan(total1,total2); return `<div class="petung-summary"><p><strong>Neptu ${escapeHtml(w1.hari)} ${escapeHtml(w1.pasaran)}:</strong> ${total1} &nbsp; <strong>Neptu ${escapeHtml(w2.hari)} ${escapeHtml(w2.pasaran)}:</strong> ${total2}</p><p><strong>Total Neptu:</strong> ${sum} &nbsp; <strong>Sisa (mod 7):</strong> ${pet.sisa7}</p><p style="font-weight:700;margin-top:8px">Interpretasi singkat: <span style="text-decoration:underline">${escapeHtml(pet.short)}</span></p><p style="margin-top:10px">${escapeHtml(tafsirByTotalNeptu(Math.round((total1+total2)/2)))}</p></div>`; }

function hitungRamalan(){ const n1 = el('nama').value.trim() || 'Anda'; const d1 = el('tanggal').value; const n2 = el('nama2').value.trim() || 'Pasangan'; const d2 = el('tanggal2').value; if(!d1 || !d2){ alert('Harap isi tanggal lahir kedua pihak.'); return; }
  const w1 = getWeton(new Date(d1+'T00:00:00')); const w2 = getWeton(new Date(d2+'T00:00:00'));
  el('summary').innerHTML = renderSummary(n1,d1,n2,d2,w1,w2);
  el('detail').innerHTML = renderDetail(w1,w2);
  el('result').hidden = false; updateShareLinkForPair(n1,d1,n2,d2); simpanRiwayat(n1+' & '+n2, `${d1} + ${d2}`, {w1,w2}); window.location.hash='#result'; }

// ---------------- Manual weton dropdown (sidebar) ----------------
function calcManualNeptu(){
  const hari = el('hariSelect').value;
  const pas = el('pasaranSelect').value;
  if(!hari || !pas){ el('manualResult').textContent = 'Silakan pilih hari dan pasaran.'; return; }
  const neptu = HARI_NEPTU[hari] + PASARAN_NEPTU[pas];
  el('manualResult').innerHTML = `<strong>${hari} ${pas}</strong><br>Neptu: ${neptu}`;
}

// ---------------- Tabel 35 weton (ke-klik) kept for backward compatibility but hidden if dropdown used ----------------
function buildWetonTable(){ const tbody = document.querySelector('#wetonTable tbody'); if(!tbody) return; tbody.innerHTML=''; for(let hi=0; hi<7; hi++){ for(let pi=0; pi<5; pi++){ const hari=HARI[hi]; const pas=PASARAN[pi]; const neptu=HARI_NEPTU[hari]+PASARAN_NEPTU[pas]; const tr=document.createElement('tr'); tr.innerHTML=`<td>${hari}</td><td>${pas}</td><td>${neptu}</td>`; tr.addEventListener('click', ()=>{ el('summary').innerHTML = `<strong>${hari} ${pas}</strong><br><em>Neptu: ${neptu}</em>`; el('detail').innerHTML = `<p>${escapeHtml(tafsirByTotalNeptu(neptu))}</p>`; el('result').hidden=false; window.location.hash='#result'; }); tbody.appendChild(tr); } } }

// ---------------- Riwayat ----------------
function simpanRiwayat(nama,tanggal,hasil){ let riwayat = JSON.parse(localStorage.getItem('wetonHistory')||'[]'); riwayat.unshift({nama,tanggal,hasil,ts:Date.now()}); localStorage.setItem('wetonHistory',JSON.stringify(riwayat.slice(0,30))); tampilkanRiwayat(); }
function tampilkanRiwayat(){ const c = el('riwayat-list'); const r = JSON.parse(localStorage.getItem('wetonHistory')||'[]'); c.innerHTML=''; r.slice(0,10).forEach(it=>{ const d = document.createElement('div'); d.className='riwayat-item'; d.innerHTML=`<strong>${escapeHtml(it.nama)}</strong><div style="font-size:13px;color:var(--muted)">${escapeHtml(it.tanggal)}</div>`; c.appendChild(d); }); }

// ---------------- Theme ----------------
const toggleThemeBtn = document.getElementById('toggleTheme'); function setThemeDark(v){ if(v){ document.documentElement.setAttribute('data-theme','dark'); toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i> Light'; localStorage.setItem('wl_theme','dark'); } else { document.documentElement.removeAttribute('data-theme'); toggleThemeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark'; localStorage.removeItem('wl_theme'); } }
toggleThemeBtn.addEventListener('click', ()=> setThemeDark(document.documentElement.getAttribute('data-theme') !== 'dark'));
(function(){ if(localStorage.getItem('wl_theme') === 'dark') setThemeDark(true); })();

// ---------------- Load from URL & Init ----------------
function loadFromURL(){ const p = new URLSearchParams(window.location.search); const n1 = p.get('n1'), d1 = p.get('d1'), n2 = p.get('n2'), d2 = p.get('d2'); if(n1) el('nama').value = n1; if(d1) el('tanggal').value = d1; if(n2) el('nama2').value = n2; if(d2) el('tanggal2').value = d2; if(d1 && d2) setTimeout(()=> hitungRamalan(), 250); }
el('copyLinkBtn').addEventListener('click', ()=>{ const inp = el('share-link'); if(!inp.value) return alert('Belum ada link'); inp.select(); document.execCommand('copy'); alert('Link disalin'); });

// --- Add missing events ---
document.getElementById("calcBtn").addEventListener("click", hitungRamalan);
document.getElementById("resetBtn").addEventListener("click", () => {
  el('nama').value = "";
  el('tanggal').value = "";
  el('nama2').value = "";
  el('tanggal2').value = "";
  el('result').hidden = true;
});

// manual calc button
document.getElementById("calcManualBtn").addEventListener("click", calcManualNeptu);

window.addEventListener('load', ()=>{ renderPlaylist(); buildWetonTable(); tampilkanRiwayat(); loadFromURL(); /* loadAssetsAudio removed */ });


