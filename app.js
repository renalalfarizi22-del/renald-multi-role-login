// --- Import modul Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCVSqHH2wUz8FK63zIYLN9Se1ARQ-xh378",
  authDomain: "renald-firebase.firebaseapp.com",
  projectId: "renald-firebase",
  storageBucket: "renald-firebase.appspot.com",
  messagingSenderId: "190771386709",
  appId: "1:190771386709:web:8a63f1774e180c7a3337dc",
  measurementId: "G-2L79ZYKXQN"
};

// --- Inisialisasi Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Simpan session login di browser ---
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Persistence berhasil diset");

    // --- Login ---
    document.getElementById("loginBtn").onclick = async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        showPopup("Email dan Password tidak boleh kosong!");
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("🔑 Login berhasil, UID:", user.uid);

        // Ambil data user dari Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        let role = "user"; // default role

        if (!docSnap.exists()) {
          // Jika user lama belum ada di Firestore, buat otomatis
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: "user",
            createdAt: new Date().toISOString()
          });
          console.log("📝 User lama ditambahkan ke Firestore dengan role user");
        } else {
          role = docSnap.data().role;
          console.log("👤 Role user:", role);
        }

        // Arahkan sesuai role
        if (role === "admin") {
          showPopup("Login sebagai Admin ✅");
          setTimeout(() => (window.location.href = "dashboard.html"), 1000);
        } else {
          showPopup("Login sebagai User ✅");
          setTimeout(() => (window.location.href = "homepage.html"), 1000);
        }
      } catch (err) {
        console.error("❌ Login error:", err);
        showPopup("Login gagal: " + err.message);
      }
    };

    // --- Register ---
    document.getElementById("registerBtn").onclick = async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        showPopup("Email dan Password tidak boleh kosong!");
        return;
      }

      if (password.length < 6) {
        showPopup("Password minimal 6 karakter!");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("✅ Register berhasil, UID:", user.uid);

        // Simpan data user ke Firestore dengan UID sebagai document ID
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString()
        });

        console.log("📝 Data user berhasil disimpan ke Firestore");

        showPopup("Akun berhasil dibuat! Silakan login. ✅");
        
        // Clear input fields
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
      } catch (err) {
        console.error("❌ Register error:", err);
        
        let errorMsg = "Gagal daftar: ";
        if (err.code === "auth/email-already-in-use") {
          errorMsg += "Email sudah terdaftar!";
        } else if (err.code === "auth/invalid-email") {
          errorMsg += "Format email tidak valid!";
        } else if (err.code === "auth/weak-password") {
          errorMsg += "Password terlalu lemah!";
        } else {
          errorMsg += err.message;
        }
        
        showPopup(errorMsg);
      }
    };
  })
  .catch((err) => {
    console.error("❌ Gagal set persistence:", err);
  });