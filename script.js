// ==========================================
// 1. CONFIGURATION & INITIALIZATION FIREBASE
// ==========================================
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// ==========================================
// 2. LOADING SCREEN LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    let count = 0;
    const percentageText = document.getElementById("loading-percentage");
    const barFill = document.getElementById("loading-bar-fill");
    const countBox = document.getElementById("loader-counting-box");
    const welcomeBox = document.getElementById("loader-welcome-box");
    const loadingScreen = document.getElementById("loading-screen");

    const counterInterval = setInterval(() => {
        count++;
        if (percentageText) percentageText.innerText = count + "%";
        if (barFill) barFill.style.width = count + "%";
        
        if (count >= 100) {
            clearInterval(counterInterval);
            if (countBox) countBox.classList.add("opacity-0");
            setTimeout(() => {
                if (countBox) countBox.classList.add("hidden");
                if (welcomeBox) {
                    welcomeBox.classList.remove("hidden");
                    setTimeout(() => {
                        welcomeBox.classList.remove("opacity-0", "scale-95");
                        welcomeBox.classList.add("opacity-100", "scale-100");
                    }, 50);
                }
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.classList.add("opacity-0", "pointer-events-none");
                        setTimeout(() => { loadingScreen.classList.add("hidden"); }, 700);
                    }
                }, 2500);
            }, 500);
        }
    }, 25);
});

// ==========================================
// 3. ADMIN PANEL & LOGIN LOGIC (UPDATED)
// ==========================================
const ADMIN_PIN = "SMANSALA2026##"; // Ganti PIN sesuai keinginanmu
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
        
        // Langsung tampilkan panel admin dan arahkan layar ke sana
        const adminPanel = document.getElementById('admin-panel');
        adminPanel.classList.remove('hidden');
        
        checkAdminUIState();
        
        // Efek auto-scroll ke panel admin agar langsung terlihat tombol Buka/Tutup
        setTimeout(() => {
            adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        alert("Login Berhasil! Akses admin diaktifkan.");
    } else {
        alert("PIN Salah! Akses ditolak.");
        document.getElementById('admin-password').value = "";
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('admin-panel').classList.add('hidden');
    checkAdminUIState();
    alert("Berhasil keluar dari mode admin.");
}

function checkAdminUIState() {
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => {
        if (isAdminLoggedIn) btn.classList.remove('hidden');
        else btn.classList.add('hidden');
    });
}

// ==========================================
// 4. REAL-TIME DATA & CONTROLS
// ==========================================

// Listen Status Akses (Buka/Tutup)
db.ref('settings/isClosed').on('value', (snapshot) => {
    const isClosed = snapshot.val();
    const overlay = document.getElementById('closed-overlay');
    if (overlay) {
        if (isClosed) overlay.classList.remove('hidden');
        else overlay.classList.add('hidden');
    }
    
    const btnAccess = document.getElementById('btn-toggle-access');
    if (btnAccess) {
        if (isClosed) {
            btnAccess.innerText = "Buka Website Sekarang";
            btnAccess.className = "bg-emerald-600 px-4 py-2 rounded-xl text-white font-bold w-full";
        } else {
            btnAccess.innerText = "Tutup Website Sekarang";
            btnAccess.className = "bg-red-600 px-4 py-2 rounded-xl text-white font-bold w-full";
        }
    }
});

function toggleWebsiteAccess() {
    if (!isAdminLoggedIn) return;
    const btnAccess = document.getElementById('btn-toggle-access');
    const isClosedNow = btnAccess.innerText.includes("Tutup");
    db.ref('settings').update({ isClosed: isClosedNow });
}

// ==========================================
// 5. OTHER UTILITIES (Gallery, Members, etc)
// ==========================================
// (Pastikan fungsi addGallery, addMember, dll. yang sudah ada tetap di sini)
function addGallery() {
    if (!isAdminLoggedIn) return;
    const title = document.getElementById('gal-title').value;
    const url = document.getElementById('gal-url').value;
    if (!title || !url) return alert("Isi judul dan URL!");
    db.ref('gallery').push({ title, url }).then(() => {
        document.getElementById('gal-title').value = "";
        document.getElementById('gal-url').value = "";
    });
}

function deleteData(path, key) {
    if (confirm("Hapus data ini?")) {
        db.ref(`${path}/${key}`).remove();
    }
}

// Ekspose fungsi ke window agar bisa diakses HTML
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.toggleWebsiteAccess = toggleWebsiteAccess;
window.addGallery = addGallery;
window.deleteData = deleteData;
