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
    async syncData() {
        if (!this.user) return;

        try {
            const userRef = doc(db, "users", this.user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const remoteData = docSnap.data();
                const remoteSessions = remoteData.sessions || [];

                // We need to merge with local window.timeTracker
                if (window.timeTracker) {
                    const localSessions = window.timeTracker.data.sessions;

                    // Simple merge strategy: ID based?
                    // We don't have IDs on sessions yet. We rely on timestamp.
                    const distinctSessions = [...localSessions];

                    let newFromRemote = 0;
                    remoteSessions.forEach(rSession => {
                        const exists = localSessions.some(lSession =>
                            lSession.timestamp === rSession.timestamp &&
                            lSession.movement === rSession.movement
                        );
                        if (!exists) {
                            distinctSessions.push(rSession);
                            newFromRemote++;
                        }
                    });

                    if (newFromRemote > 0) {
                        console.log(`Synced ${newFromRemote} sessions from cloud.`);
                        window.timeTracker.data.sessions = distinctSessions;
                        window.timeTracker.saveData();

                        // Update UI if stats UI is open or home stats
                        // Trigger a page reload or custom event? 
                        // Simplest is to just re-run updateHomeStats if it exists
                        // But it's inside a closure in index.html.
                        // We can reload the page if it's a fresh login with new data?
                        // Or just let the user see it next time.
                    }

                    // Also upload any local sessions that aren't in remote (if we wanted full 2-way sync)
                    // For now, simpler is better. Use 'saveSession' individually when they finish.
                    // But for initial data, maybe we should bulk upload?
                    // Let's implement a bulk merge upstream later if needed.
                }
            }
        } catch (e) {
            console.error('Sync failed', e);
        }
    }
}

// expose to window
window.firebaseManager = new FirebaseManager();
