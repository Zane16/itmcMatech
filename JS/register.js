  
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
  import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
  
  // Firebase Configuration
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
  
  function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => {
      messageDiv.style.opacity = 0;
    }, 5000);
  }
  

  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get("role");
  
 
  

  const signup = document.getElementById("submit-btn");
  signup.addEventListener("click", (event) => {
    event.preventDefault();
    const email = document.getElementById("remail").value;
    const password = document.getElementById("rpassword").value;
    const username = document.getElementById("rname").value;
  
    const auth = getAuth();
    const db = getFirestore();
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userData = {
          email: email,
          username: username,
          role: role, 
        };
        showMessage("Account Created Successfully", "signUpMessage");
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
          .then(() => {
            window.location.href = "/Login.html";
          })
          .catch((error) => {
            console.error("Error writing document", error);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === "auth/email-already-in-use") {
          showMessage("Email Address Already Exists!", "signUpMessage");
        } else {
          showMessage("Unable to create User", "signUpMessage");
        }
      });
  });