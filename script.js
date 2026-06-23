// 1. Inisialisasi Konfigurasi Firebase Anda
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// State Variabel Internal
let currentWebsiteStatus = true; 
let isAdminLoggedIn = false;
const ADMIN_PIN = "123456"; // Ganti PIN admin ini sesuai keinginan Anda

// 2. Listener Real-time Status Akses Website Publik
db.ref('settings/isWebsiteOpen').on('value', (snapshot) => {
    const status = snapshot.val();
    currentWebsiteStatus = status !== null ? status : true;

    const overlay = document.getElementById('closed-overlay');
    const statusText = document.getElementById('status-text');
    const btnToggle = document.getElementById('btn-toggle-access');

    if (currentWebsiteStatus) {
        overlay.classList.add('hidden');
        if (statusText) statusText.innerText = "BUKA (PUBLIK)";
        if (statusText) statusText.className = "text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg";
        if (btnToggle) btnToggle.innerText = "Tutup Akses Website";
        if (btnToggle) btnToggle.className = "bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow transition";
    } else {
        if (!isAdminLoggedIn) {
            overlay.classList.remove('hidden');
        }
        if (statusText) statusText.innerText = "DITUTUP (ADMIN ONLY)";
        if (statusText) statusText.className = "text-xs font-bold uppercase bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg";
        if (btnToggle) btnToggle.innerText = "Buka Akses Website";
        if (btnToggle) btnToggle.className = "bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow transition";
    }
});

// 3. Listener Real-time Mengambil Data Galeri Kegiatan
db.ref('gallery').on('value', (snapshot) => {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        container.innerHTML = `<div class="text-center py-8 col-span-full text-slate-500">Belum ada foto kegiatan.</div>`;
        return;
    }
    Object.keys(data).forEach(key => {
        const item = data[key];
        container.innerHTML += `
            <div class="group relative overflow-hidden rounded-xl bg-slate-800 aspect-video shadow-md">
                <img src="${item.url}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500'">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-3 justify-between">
                    <span class="text-xs font-semibold text-slate-200 line-clamp-1">${item.title}</span>
                    ${isAdminLoggedIn ? `<button onclick="deleteData('gallery/${key}')" class="bg-red-600/80 hover:bg-red-600 p-1.5 rounded text-white text-xs transition"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>
        `;
    });
});

// 4. Listener Real-time Mengambil Data Anggota Kelas
db.ref('members').on('value', (snapshot) => {
    const container = document.getElementById('members-container');
    if (!container) return;
    container.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        container.innerHTML = `<div class="text-center py-8 col-span-full text-slate-500">Belum ada data anggota kelas.</div>`;
        return;
    }
    Object.keys(data).forEach(key => {
        const item = data[key];
        const placeholderAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`;
        container.innerHTML += `
            <div class="glass p-4 rounded-xl flex flex-col items-center text-center relative group">
                <span class="absolute top-2 left-2 bg-slate-800/80 text-slate-400 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-slate-700">${item.absen}</span>
                <img src="${item.url || placeholderAvatar}" alt="${item.name}" class="w-16 h-16 rounded-full object-cover mb-3 border-2 border-slate-700 group-hover:border-indigo-400 transition" onerror="this.src='${placeholderAvatar}'">
                <h5 class="text-xs font-bold text-slate-200 line-clamp-2">${item.name}</h5>
                ${isAdminLoggedIn ? `<button onclick="deleteData('members/${key}')" class="mt-3 text-[10px] bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2 py-0.5 rounded transition"><i class="fas fa-user-minus mr-1"></i>Hapus</button>` : ''}
            </div>
        `;
    });
});

// 5. Listener Real-time Mengambil Data Struktur Organisasi
db.ref('structure').on('value', (snapshot) => {
    const container = document.getElementById('structure-container');
    if (!container) return;
    container.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        container.innerHTML = `<div class="text-center py-8 col-span-full text-slate-500">Belum ada struktur organisasi.</div>`;
        return;
    }
    Object.keys(data).forEach(key => {
        const item = data[key];
        container.innerHTML += `
            <div class="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <span class="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">${item.role}</span>
                    <h5 class="text-sm font-bold text-slate-200 mt-0.5">${item.name}</h5>
                </div>
                ${isAdminLoggedIn ? `<button onclick="deleteData('structure/${key}')" class="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-1.5 rounded transition text-xs"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div>
        `;
    });
});

// ================= AUTENTIKASI & KENDALIAN ADMIN =================
function openAdminModal() { document.getElementById('admin-login-modal').classList.remove('hidden'); }
// Fungsi ini juga dibuat global agar bisa dipanggil tombol close 'X'
window.openAdminModal = openAdminModal;

function closeAdminModal() { document.getElementById('admin-login-modal').classList.add('hidden'); }
window.closeAdminModal = closeAdminModal;

function loginAdmin() {
    const input = document.getElementById('admin-password').value;
    if (input === ADMIN_PIN) {
        isAdminLoggedIn = true;
        alert('Login Admin Berhasil!');
        closeAdminModal();
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('closed-overlay').classList.add('hidden');
        
        // Memicu trigger refresh lokal untuk memunculkan tombol hapus/delete data
        db.ref('gallery').get().then(() => db.ref('gallery').push().set(null));
        db.ref('members').get().then(() => db.ref('members').push().set(null));
        db.ref('structure').get().then(() => db.ref('structure').push().set(null));
    } else {
        alert('Password/PIN Admin salah!');
    }
}
window.loginAdmin = loginAdmin;

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('admin-panel').classList.add('hidden');
    if (!currentWebsiteStatus) {
        document.getElementById('closed-overlay').classList.remove('hidden');
    }
    alert('Berhasil Keluar dari mode Administrator.');
    location.reload();
}
window.logoutAdmin = logoutAdmin;

function toggleWebsiteAccess() {
    db.ref('settings').update({
        isWebsiteOpen: !currentWebsiteStatus
    });
}
window.toggleWebsiteAccess = toggleWebsiteAccess;

// ================= AKSI TAMBAH DATA (ADMIN ONLY) =================
function addGallery() {
    const title = document.getElementById('gal-title').value;
    const url = document.getElementById('gal-url').value;
    if (!title || !url) return alert('Mohon isi semua form galeri!');
    db.ref('gallery').push({ title, url }).then(() => {
        document.getElementById('gal-title').value = '';
        document.getElementById('gal-url').value = '';
    });
}
window.addGallery = addGallery;

function addMember() {
    const absen = document.getElementById('mem-abs').value;
    const name = document.getElementById('mem-name').value;
    const url = document.getElementById('mem-url').value;
    if (!absen || !name) return alert('Mohon isi Nomor Absen dan Nama!');
    db.ref('members').push({ absen: parseInt(absen), name, url }).then(() => {
        document.getElementById('mem-abs').value = '';
        document.getElementById('mem-name').value = '';
        document.getElementById('mem-url').value = '';
    });
}
window.addMember = addMember;

function addStructure() {
    const role = document.getElementById('str-role').value;
    const name = document.getElementById('str-name').value;
    if (!role || !name) return alert('Mohon isi Jabatan dan Nama!');
    db.ref('structure').push({ role, name }).then(() => {
        document.getElementById('str-role').value = '';
        document.getElementById('str-name').value = '';
    });
}
window.addStructure = addStructure;

// ================= AKSI HAPUS DATA (ADMIN ONLY) =================
function deleteData(path) {
    if (confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
        db.ref(path).remove().then(() => alert('Konten berhasil dihapus secara real-time.'));
    }
}
window.deleteData = deleteData;
