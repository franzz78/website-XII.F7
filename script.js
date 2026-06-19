import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// GANTI DENGAN KONFIGURASI FIREBASE KAMU
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "proyek-kelas.firebaseapp.com",
    databaseURL: "https://proyek-kelas-default-rtdb.firebaseio.com",
    projectId: "proyek-kelas",
    storageBucket: "proyek-kelas.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elemen UI
const elPengumuman = document.getElementById('text-pengumuman');
const elTgl = document.getElementById('tgl-pengumuman');
const elJadwal = document.getElementById('text-jadwal');
const elKas = document.getElementById('text-kas');
const elPiket = document.getElementById('text-piket');
const elTugas = document.getElementById('text-tugas');

// Mendengarkan data secara Real-time
function listenData() {
    // Info Utama
    onValue(ref(db, 'dashboard/info'), (snapshot) => {
        const data = snapshot.val();
        elPengumuman.innerText = data.pengumuman || "Tidak ada pengumuman";
        elTgl.innerText = data.tanggal || "";
    });

    // Jadwal
    onValue(ref(db, 'dashboard/jadwal_besok'), (snapshot) => {
        elJadwal.innerText = snapshot.val() || "Libur";
    });

    // Kas
    onValue(ref(db, 'dashboard/kas'), (snapshot) => {
        elKas.innerText = "Rp " + (snapshot.val() || 0).toLocaleString('id-ID');
    });

    // Piket
    onValue(ref(db, 'dashboard/piket'), (snapshot) => {
        elPiket.innerText = snapshot.val() || "-";
    });

    // Tugas
    onValue(ref(db, 'dashboard/tugas'), (snapshot) => {
        elTugas.innerText = snapshot.val() || "Santai, tidak ada tugas!";
    });
}

listenData();
