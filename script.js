// 1. Konfigurasi Real-time Database Firebase Milik Anda
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

let currentWebsiteStatus = true; 
let isAdminLoggedIn = false;
const ADMIN_PIN = "123456"; // PIN admin pelindung utama ganti di sini

// 2. Akses Monitor Real-time
db.ref('settings/isWebsiteOpen').on('value', (snapshot) => {
    const status = snapshot.val();
    currentWebsiteStatus = status !== null ? status : true;

    const overlay = document.getElementById('closed-overlay');
    const btnToggle = document.getElementById('btn-toggle-access');

    if (currentWebsiteStatus) {
        overlay.classList.add('hidden');
        if (btnToggle) {
            btnToggle.innerText = "Tutup Website";
            btnToggle.className = "bg-red-600 px-3 py-1 rounded text-white";
        }
    } else {
        if (!isAdminLoggedIn) overlay.classList.remove('hidden');
        if (btnToggle) {
            btnToggle.innerText = "Buka Website";
            btnToggle.className = "bg-emerald-600 px-3 py-1 rounded text-white";
        }
    }
});

// 3. Render Real-time Galeri Foto Kegiatan
db.ref('gallery').on('value', (snapshot) => {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        container.innerHTML = `<p class="text-xs text-slate-500 col-span-2 text-center py-4">Belum ada foto.</p>`;
        return;
    }
    Object.keys(data).forEach(key => {
        const item = data[key];
        container.innerHTML += `
            <div class="relative group rounded-xl overflow-hidden aspect-video bg-white/5 border border-white/5">
                <img src="${item.url}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                    <span class="text-[10px] font-medium text-center line-clamp-2">${item.title}</span>
                    ${isAdminLoggedIn ? `<button onclick="deleteData('gallery/${key}')" class="absolute top-1 right-1 bg-red-600 text-white p-1 rounded text-[9px]"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>
        `;
    });
});

// 4. Render Real-time Anggota Siswa
db.ref('members').on('value', (snapshot) => {
    const container = document.getElementById('members-container');
    if (!container) return;
    container.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        container.innerHTML = `<p class="text-xs text-slate-500 col-span-3 text-center py-4">Kosong.</p>`;
        return;
    }
    Object.keys(data).forEach(key => {
        const item = data[key];
        const avatar = item.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`;
        container.innerHTML += `
            <div class="glass p-3 rounded-xl flex flex-col items-center relative text-center">
                <span class="absolute top-1 left-1.5 text-[8px] text-slate-500 font-mono">#${item.absen}</span>
                <img src="${avatar}" class="w-10 h-10 rounded-full object-cover border border-white/10 mb-1">
                <p class="text-[10px] font-bold tracking-tight line-clamp-1 text-slate-200">${item.name}</p>
                ${isAdminLoggedIn ? `<button onclick="deleteData('members/${key}')" class="text-[8px] text-red-400 hover:underline mt-1">Hapus</button>` : ''}
            </div>
        `;
    });
});

// 5. Render Real-time Bagan Struktur Organisasi (Meniru Bagan Alur di Gambar)
db.ref('structure').on('value', (snapshot) => {
    const container = document.getElementById('structure-container');
    if (!container) return;
    container.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        container.innerHTML = `<p class="text-xs text-slate-500 text-center py-2">Bagan belum dibuat.</p>`;
        return;
    }
    
    let index = 0;
    Object.keys(data).forEach(key => {
        const item = data[key];
        
        // Buat komponen node dan garis alur penghubung secara otomatis
        if (index > 0) {
            container.innerHTML += `<div class="tree-line"></div>`;
        }
        
        container.innerHTML += `
            <div class="tree-node">
                <span class="text-[9px] uppercase font-bold tracking-widest text-purple-400 mb-1">${item.role}</span>
                <div class="node-card relative">
                    ${item.name}
                    ${isAdminLoggedIn ? `<button onclick="deleteData('structure/${key}')" class="absolute -right-6 top-1 text-red-500 text-[10px]"><i class="fas fa-minus-circle"></i></button>` : ''}
                </div>
            </div>
        `;
        index++;
    });
});

// ================= ACTION UTILITY UTAMA =================
function openAdminModal() { document.getElementById('admin-login-modal').classList.remove('hidden'); }
window.openAdminModal = openAdminModal;

function closeAdminModal() { document.getElementById('admin-login-modal').classList.add('hidden'); }
window.closeAdminModal = closeAdminModal;

function loginAdmin() {
    const input = document.getElementById('admin-password').value;
    if (input === ADMIN_PIN) {
        isAdminLoggedIn = true;
        alert('Dashboard Admin Terbuka!');
        closeAdminModal();
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('closed-overlay').classList.add('hidden');
        // Refresh trigger view lokal
        db.ref('settings/isWebsiteOpen').get();
    } else {
        alert('PIN Keliru!');
    }
}
window.loginAdmin = loginAdmin;

function logoutAdmin() { location.reload(); }
window.logoutAdmin = logoutAdmin;

function toggleWebsiteAccess() {
    db.ref('settings').update({ isWebsiteOpen: !currentWebsiteStatus });
}
window.toggleWebsiteAccess = toggleWebsiteAccess;

function addGallery() {
    const title = document.getElementById('gal-title').value;
    const url = document.getElementById('gal-url').value;
    if (title && url) db.ref('gallery').push({ title, url }).then(() => { alert('Foto tersimpan!'); });
}
window.addGallery = addGallery;

function addMember() {
    const absen = document.getElementById('mem-abs').value;
    const name = document.getElementById('mem-name').value;
    const url = document.getElementById('mem-url').value;
    if (absen && name) db.ref('members').push({ absen: parseInt(absen), name, url }).then(() => { alert('Siswa disimpan!'); });
}
window.addMember = addMember;

function addStructure() {
    const role = document.getElementById('str-role').value;
    const name = document.getElementById('str-name').value;
    if (role && name) db.ref('structure').push({ role, name }).then(() => { alert('Jabatan terpasang!'); });
}
window.addStructure = addStructure;

function deleteData(path) {
    if (confirm('Hapus item ini?')) db.ref(path).remove();
}
window.deleteData = deleteData;
