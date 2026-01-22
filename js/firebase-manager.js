import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYgZr8VRSaaAQdk-aGNtSwL_MwOA23ibw",
    authDomain: "tolnriupdates.firebaseapp.com",
    projectId: "tolnriupdates",
    storageBucket: "tolnriupdates.firebasestorage.app",
    messagingSenderId: "666794786048",
    appId: "1:666794786048:web:7584c7cde4ef47ba7907e5"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

class FirebaseManager {
    constructor() {
        this.user = null;
        this.initAuthListener();
        this.bindLoginButton();
    }

    // Bind UI elements
    bindLoginButton() {
        const btn = document.getElementById('login-btn');
        const profile = document.getElementById('user-profile');

        if (btn) {
            btn.addEventListener('click', () => this.login());
        }

        if (profile) {
            profile.addEventListener('click', () => {
                if (confirm('Logout?')) {
                    this.logout();
                }
            });
        }
    }

    // Auth State Listener
    initAuthListener() {
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            this.updateUI(user);

            if (user) {
                console.log('User logged in:', user.email);
                this.syncData();
            } else {
                console.log('User logged out');
            }
        });
    }

    // Login
    async login() {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Login failed', error);
            alert('Login failed: ' + error.message);
        }
    }

    // Logout
    async logout() {
        try {
            await signOut(auth);
            // Optionally clear local data or keep it?
            // For now, we keep local data, but next sync won't happen.
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    // UI Updates
    updateUI(user) {
        const btn = document.getElementById('login-btn');
        const profile = document.getElementById('user-profile');
        const avatar = document.getElementById('user-avatar');

        if (user) {
            if (btn) btn.style.display = 'none';
            if (profile) {
                profile.classList.remove('hidden');
                if (avatar) avatar.src = user.photoURL || 'assets/logo/tolnrilogo.png';
            }
        } else {
            if (btn) btn.style.display = 'flex';
            if (profile) profile.classList.add('hidden');
        }
    }

    // Save a completed session
    async saveSession(session) {
        if (!this.user) return;

        try {
            const userRef = doc(db, "users", this.user.uid);

            // Check if doc exists first, if not create it
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                await setDoc(userRef, {
                    email: this.user.email,
                    sessions: [session],
                    lastSynced: new Date().toISOString()
                });
            } else {
                await updateDoc(userRef, {
                    sessions: arrayUnion(session),
                    lastSynced: new Date().toISOString()
                });
            }
            console.log('Session saved to Firebase');
        } catch (e) {
            console.error('Error saving session to Firebase:', e);
        }
    }

    // Sync Data (Simple Strategy: Upload local sessions that might be missing?)
    // Real sync is complex. For now, we'll just ensure the user doc exists and maybe pull stats?
    // Actually, the requirement says "data storage across sessions and devices".
    // This implies we should DOWNLOAD data too.
    // Sync Data: Two-way synchronization
    // 1. Upload local sessions that are not in cloud.
    // 2. Download cloud sessions that are not in local.
    async syncData() {
        if (!this.user || !window.timeTracker) return;

        try {
            const userRef = doc(db, "users", this.user.uid);
            const docSnap = await getDoc(userRef);

            let remoteSessions = [];

            if (docSnap.exists()) {
                remoteSessions = docSnap.data().sessions || [];
            } else {
                // If user doesn't exist yet, we'll create them with local data soon
                console.log("New user detected, creating existing remote doc...");
            }

            const localSessions = window.timeTracker.data.sessions;

            // --- 1. Push Local -> Remote ---
            // Find sessions in local that are NOT in remote
            const sessionsToUpload = localSessions.filter(lSession => {
                return !remoteSessions.some(rSession =>
                    rSession.timestamp === lSession.timestamp &&
                    rSession.movement === lSession.movement
                );
            });

            if (sessionsToUpload.length > 0) {
                console.log(`Uploading ${sessionsToUpload.length} local sessions to cloud...`);

                if (!docSnap.exists()) {
                    await setDoc(userRef, {
                        email: this.user.email,
                        sessions: sessionsToUpload,
                        lastSynced: new Date().toISOString()
                    });
                } else {
                    await updateDoc(userRef, {
                        sessions: arrayUnion(...sessionsToUpload),
                        lastSynced: new Date().toISOString()
                    });
                }
                // Add these to our local "remoteSessions" copy so we don't re-add them below
                remoteSessions.push(...sessionsToUpload);
            }

            // --- 2. Pull Remote -> Local ---
            // Find sessions in remote that are NOT in local
            const sessionsToDownload = remoteSessions.filter(rSession => {
                return !localSessions.some(lSession =>
                    lSession.timestamp === rSession.timestamp &&
                    lSession.movement === rSession.movement
                );
            });

            if (sessionsToDownload.length > 0) {
                console.log(`Downloading ${sessionsToDownload.length} sessions from cloud...`);
                window.timeTracker.data.sessions.push(...sessionsToDownload);

                // Sort by timestamp to keep things tidy
                window.timeTracker.data.sessions.sort((a, b) => a.timestamp - b.timestamp);

                window.timeTracker.saveData();

                // NOTIFY UI
                window.dispatchEvent(new CustomEvent('time-tracker-update'));
            } else {
                console.log('Local is already up to date.');
            }

        } catch (e) {
            console.error('Sync failed', e);
        }
    }
}

// expose to window
window.firebaseManager = new FirebaseManager();
