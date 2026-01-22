import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYgZr8VRSaaAQdk-aGNtSwL_MwOA23ibw",
    authDomain: "tolnriupdates.firebaseapp.com",
    projectId: "tolnriupdates",
    storageBucket: "tolnriupdates.firebasestorage.app",
    messagingSenderId: "666794786048",
    appId: "1:666794786048:web:7584c7cde4ef47ba7907e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Global namespace for other scripts to access
window.ToLFirebase = {
    auth,
    db,
    login: async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
        }
    },
    logout: async () => {
        try {
            await signOut(auth);
            // Optional: clear local data or reload page
            location.reload();
        } catch (error) {
            console.error("Logout failed", error);
        }
    },
    saveData: async (data) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            // Ensure specific fields are rounded integers before saving
            // Although TimeTracker should handle this, double safety here doesn't hurt,
            // but we will rely on TimeTracker passing cleaner data.
            await setDoc(doc(db, "users", user.uid), data, { merge: true });
        } catch (e) {
            console.error("Error saving to Firebase:", e);
        }
    }
};

// ---------------
// UI & State Logic
// ---------------

// Helper: Round all numbers in an object/array structure (recursive, safely)
// We specifically care about the 'sessions' array duration. 
// But TimeTracker handles the logic. This is just for Sync details if needed.

onAuthStateChanged(auth, async (user) => {
    const presentedNameEl = document.querySelector('.presented-name');
    const presentedLabelEl = document.querySelector('.presented-label');
    const menuPanel = document.querySelector('.menu-panel');
    const headerMark = document.querySelector('.brand-mark');

    if (user) {
        // 1. UI Updates
        if (presentedNameEl) presentedNameEl.textContent = user.displayName;
        if (presentedLabelEl) presentedLabelEl.textContent = "Welcome back,"; // Optional touch

        // Inject User Icon
        // Check if icon already exists to avoid dupes
        let userIcon = document.querySelector('.brand-user-icon');
        if (!userIcon && headerMark) {
            userIcon = document.createElement('img');
            userIcon.className = 'brand-user-icon';
            userIcon.src = user.photoURL;
            userIcon.alt = "User Profile";
            userIcon.style.cssText = `
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            position: absolute; 
            top: 10px; 
            left: 10px; 
            border: 2px solid var(--accent-gold, #cfa855);
            object-fit: cover;
            z-index: 100;
        `;
            // headerMark is usually relative or flex. We might need to ensure header has relative positioning
            // or place it specifically.
            // The user asked for "top left corner of the header".
            // .brand-header is usually the container.
            const header = document.querySelector('.brand-header');
            if (header) {
                header.style.position = 'relative';
                header.appendChild(userIcon);
            }
        }

        // Update Menu to show Logout
        updateMenuForLogin(true);

        // 2. Data Sync Logic
        // Check if new user or existing
        const userDocRef = doc(db, "users", user.uid);
        try {
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                console.log("Existing user found. Syncing data down...");
                const data = docSnap.data();
                if (window.timeTracker) {
                    // If cloud data exists, overload local data
                    window.timeTracker.importData(JSON.stringify(data));
                    window.timeTracker.refreshStatsUI(); // New method we need to add to Tracker or UI
                }
            } else {
                console.log("New user (or first login). Resetting local data and starting fresh.");
                if (window.timeTracker) {
                    // RESET local data
                    window.timeTracker.clearAllData();
                    // Save empty state to Firebase immediately to claim the user doc
                    window.timeTracker.saveData();
                }
            }

            // Setup listener for updates (optional, for multi-device realtime)
            // For now, let's just pull once on load. Realtime might conflict if we are also writing.
            // Simpler model: Read on load, Write on change.

        } catch (e) {
            console.error("Error checking user data:", e);
        }

    } else {
        // User is logged out
        if (presentedNameEl) presentedNameEl.textContent = "Brian O'Kelly";
        if (presentedLabelEl) presentedLabelEl.textContent = "presented by:";
        const userIcon = document.querySelector('.brand-user-icon');
        if (userIcon) userIcon.remove();

        updateMenuForLogin(false);
    }
});

function updateMenuForLogin(isLoggedIn) {
    const menuPanel = document.querySelector('.menu-panel');
    if (!menuPanel) return;

    // Remove existing login/logout buttons to prevent dupes
    const existingBtn = menuPanel.querySelector('.auth-btn');
    if (existingBtn) existingBtn.remove();

    const btn = document.createElement('a');
    btn.className = 'auth-btn';
    btn.href = "#";
    btn.style.fontWeight = "bold";

    if (isLoggedIn) {
        btn.textContent = "🚪 Logout";
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.ToLFirebase.logout();
        });
    } else {
        btn.textContent = "🔑 Login";
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.ToLFirebase.login();
        });
    }

    // Append at the end
    menuPanel.appendChild(btn);
}
