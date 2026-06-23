// ==========================================
// 1. CONFIGURATION & INITIALIZATION FIREBASE
// ==========================================
// Terhubung langsung ke Realtime Database absensi-polri milikmu
const firebaseConfig = {
    apiKey: "AIzaSyD9BmV4XKXuMWa4PZHpb7Bbt-rHs61m3lE",
    authDomain: "absensi-polri.firebaseapp.com",
    databaseURL: "https://absensi-polri-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "absensi-polri",
    storageBucket: "absensi-polri.firebasestorage.app",
    messagingSenderId: "19006760644",
    appId: "1:19006760644:web:b7dac0410e47877ded4b91",
    measurementId: "G-82KHRYZBN0"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// ==========================================
// 2. REAL-TIME DATA LISTENERS (READ)
// ==========================================

// A. Listen Status Akses Website (Buka/Tutup)
db.ref('settings/isClosed').on('value', (snapshot) => {
    const isClosed = snapshot.val();
    const overlay = document.getElementById('closed-overlay');
    if (overlay) {
        if (isClosed) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
    
    const btnAccess = document.getElementById('btn-toggle-access');
    if (btnAccess) {
        if (isClosed) {
            btnAccess.innerText = "Buka Website";
            btnAccess.className = "bg-emerald-600 px-3 py-1 rounded text-white";
        } else {
            btnAccess.innerText = "Tutup Website";
            btnAccess.className = "bg-red-600 px-3 py-1 rounded text-white";
        }
    }
});

// B. Sinkronisasi Status Musik Global dari Database Admin
db.ref('settings/isMusicPlayGlobal').on('value', (snapshot) => {
    const status = snapshot.val();
    isMusicActiveGlobal = status !== null ? status : true;

    const btnGlobal = document.getElementById('btn-global-music');
    if (btnGlobal) {
        if (isMusicActiveGlobal) {
            btnGlobal.innerText = "Musik ON";
            btnGlobal.className = "bg-emerald-600 px-3 py-1 rounded text-white";
        } else {
            btnGlobal.innerText = "Musik OFF";
            btnGlobal.className = "bg-red-600 px-3 py-1 rounded text-white";
        }
    }

    // Eksekusi putar/matikan musik di sisi client secara real-time
    if (isMusicActiveGlobal) {
        if (typeof userInteracted !== 'undefined' && userInteracted && typeof startMusicPlayback === 'function') {
            startMusicPlayback();
        }
    } else {
        if (typeof stopMusicPlayback === 'function') {
            stopMusicPlayback();
        }
    }
});

// C. Listen Data Galeri Kelas
db.ref('gallery').on('value', (snapshot) => {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = "";
    
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            
            const card = document.createElement('div');
            card.className = "glass p-2 rounded-2xl relative group overflow-hidden shadow-md";
            card.innerHTML = `
                <img src="${data.url}" class="w-full h-28 object-cover rounded-xl shadow-inner" alt="${data.title}">
                <p class="text-[10px] font-bold text-slate-300 mt-1.5 px-1 truncate uppercase tracking-wide">${data.title}</p>
                <button onclick="deleteData('gallery', '${key}')" class="admin-only absolute top-3 right-3 bg-red-600/80 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition hidden">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = `<p class="text-xs text-slate-500 italic text-center col-span-2 py-4">Belum ada foto dokumentasi.</p>`;
    }
    checkAdminUIState();
});

// D. 🌟 LISTEN DATA ANGGOTA KELAS (FORMAT LIST MENU SAMPING & REALTIME COUNTER) 🌟
db.ref('members').orderByChild('absen').on('value', (snapshot) => {
    const container = document.getElementById('members-container');
    if (!container) return;
    container.innerHTML = "";
    
    // Perbarui jumlah total anggota di badge counter atas
    const totalSiswa = snapshot.numChildren();
    const countBadge = document.getElementById('member-count');
    if (countBadge) countBadge.innerText = `${totalSiswa} Siswa`;
    
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            
            // Logika foto opsional: gunakan avatar jika URL kosong
            const imgElement = data.url && data.url.trim() !== "" 
                ? `<img src="${data.url}" class="w-7 h-7 rounded-full object-cover border border-purple-500/30 shadow-md">`
                : `<div class="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/20 text-[10px] text-purple-400"><i class="fas fa-user"></i></div>`;
            
            const listRow = document.createElement('div');
            listRow.className = "glass flex items-center gap-3 px-4 py-2.5 rounded-xl w-full relative group transition hover:border-purple-500/30";
            listRow.innerHTML = `
                ${imgElement}
                <span class="text-xs font-bold text-purple-400 tracking-wider">#${data.absen}</span>
                <span class="text-slate-600 text-xs">|</span>
                <span class="text-xs font-extrabold text-white uppercase tracking-wide truncate">${data.name}</span>
                
                <button onclick="deleteData('members', '${key}')" class="admin-only absolute right-3 top-1/2 -translate-y-1/2 bg-red-600/80 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition hidden">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(listRow);
        });
    } else {
        container.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-4">Daftar siswa masih kosong.</p>`;
    }
    checkAdminUIState();
});

// E. Listen Data Struktur Organisasi
db.ref('structure').on('value', (snapshot) => {
    const container = document.getElementById('structure-container');
    if (!container) return;
    container.innerHTML = "";
    
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            
            const node = document.createElement('div');
            node.className = "glass p-3 rounded-xl w-full max-w-[280px] text-center relative border-l-2 border-l-purple-500";
            node.innerHTML = `
                <h5 class="text-[10px] uppercase font-bold tracking-widest text-purple-400">${data.role}</h5>
                <p class="text-xs font-black text-white mt-0.5 uppercase tracking-wide">${data.name}</p>
                <button onclick="deleteData('structure', '${key}')" class="admin-only absolute top-1/2 -translate-y-1/2 right-3 bg-red-600/80 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition hidden">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(node);
        });
    } else {
        container.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-2">Struktur organisasi belum diatur.</p>`;
    }
    checkAdminUIState();
});

// ==========================================
// 3. ADMIN PANEL LOGIC (CONTROLS & WRITE)
// ==========================================
const ADMIN_PIN = "1234"; // Ganti PIN login admin kelasmu di sini
let isAdminLoggedIn = false;

function openAdminModal() {
    document.getElementById('admin-login-modal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('admin-login-modal').classList.add('hidden');
    document.getElementById('admin-password').value = "";
}

function loginAdmin() {
    const inputPassword = document.getElementById('admin-password').value;
    if (inputPassword === ADMIN_PIN) {
        isAdminLoggedIn = true;
        closeAdminModal();
        document.getElementById('admin-panel').classList.remove('hidden');
        checkAdminUIState();
        alert("Login Sukses! Menu manajemen data dan tombol hapus kini aktif.");
        document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("PIN Salah! Akses ditolak.");
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('admin-panel').classList.add('hidden');
    checkAdminUIState();
    alert("Berhasil keluar dari mode administrator.");
}

function checkAdminUIState() {
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => {
        if (isAdminLoggedIn) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
}

function toggleWebsiteAccess() {
    if (!isAdminLoggedIn) return;
    const btnAccess = document.getElementById('btn-toggle-access');
    if (!btnAccess) return;
    const currentStatus = btnAccess.innerText === "Tutup Website";
    db.ref('settings').update({ isClosed: currentStatus });
}

// Fungsi Saklar Remote Musik Jarak Jauh Global
function toggleGlobalMusic() {
    if (!isAdminLoggedIn) return;
    db.ref('settings').update({ isMusicPlayGlobal: !isMusicActiveGlobal });
}

function addGallery() {
    if (!isAdminLoggedIn) return;
    const title = document.getElementById('gal-title').value;
    const url = document.getElementById('gal-url').value;
    if (!title || !url) return alert("Semua form wajib diisi!");
    
    db.ref('gallery').push({ title, url }).then(() => {
        document.getElementById('gal-title').value = "";
        document.getElementById('gal-url').value = "";
    });
}

function addMember() {
    if (!isAdminLoggedIn) return;
    const absen = parseInt(document.getElementById('mem-abs').value);
    const name = document.getElementById('mem-name').value;
    const url = document.getElementById('mem-url').value;
    if (isNaN(absen) || !name) return alert("Nomor absen dan nama harus diisi!");
    
    db.ref('members').push({ absen, name, url: url || "" }).then(() => {
        document.getElementById('mem-abs').value = "";
        document.getElementById('mem-name').value = "";
        document.getElementById('mem-url').value = "";
    });
}

function addStructure() {
    if (!isAdminLoggedIn) return;
    const role = document.getElementById('str-role').value;
    const name = document.getElementById('str-name').value;
    if (!role || !name) return alert("Jabatan dan Nama harus diisi!");
    
    db.ref('structure').push({ role, name }).then(() => {
        document.getElementById('str-role').value = "";
        document.getElementById('str-name').value = "";
    });
}

function deleteData(path, key) {
    if (!isAdminLoggedIn) return;
    if (confirm("Apakah kamu yakin ingin menghapus data ini secara permanen dari database?")) {
        db.ref(`${path}/${key}`).remove();
    }
}

// Daftarkan fungsi ke objek window global
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.toggleWebsiteAccess = toggleWebsiteAccess;
window.toggleGlobalMusic = toggleGlobalMusic;
window.addGallery = addGallery;
window.addMember = addMember;
window.addStructure = addStructure;
window.deleteData = deleteData;
