// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDe5nZSDQ-N5gTuoL2r7Q-9Z0oh7C_pc-k",
  authDomain: "matech-01.firebaseapp.com",
  projectId: "matech-01",
  storageBucket: "matech-01.firebasestorage.app",
  messagingSenderId: "600983949439",
  appId: "1:600983949439:web:b66d7030a4aea1f787af4a",
  measurementId: "G-FTZXQ1RSSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Function to display messages
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}


const signin = document.getElementById('signIn-btn');
signin.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const auth = getAuth();
  const db = getFirestore();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userId = user.uid;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role; // Role stored during registration

      // Store logged-in user ID
      localStorage.setItem('loggedInUserId', userId);

      // Redirect based on role
      if (role === "Manager") {
        window.location.href = "/Manager/review.html";
      } else if (role === "Client") {
        window.location.href = "/Client/dashboard-client.html";
      } else if (role === "Technician") {
        window.location.href = "/Technician/Tech-dash.html";
      } else {
        showMessage("Role not recognized. Please contact support.", "signInMessage");
      }
    } else {
      showMessage("User data not found. Please contact support.", "signInMessage");
    }
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === "auth/wrong-password") {
      showMessage("Incorrect Email or Password", "signInMessage");
    } else if (errorCode === "auth/user-not-found") {
      showMessage("Account does not exist. Please sign up.", "signInMessage");
    } else {
      showMessage("Login failed. Please try again later.", "signInMessage");
    }
  }
});
