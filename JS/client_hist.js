import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDe5nZSDQ-N5gTuoL2r7Q-9Z0oh7C_pc-k",
    authDomain: "matech-01.firebaseapp.com",
    projectId: "matech-01",
    storageBucket: "matech-01.appspot.com",
    messagingSenderId: "600983949439",
    appId: "1:600983949439:web:7ba30458ad99758c87af4a",
    measurementId: "G-MYLH77L240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to fetch and display tickets
async function fetchUserTickets() {
    const user = auth.currentUser;

    if (!user) {
        alert("User not authenticated.");
        console.log("auth.currentUser is null.");
        return;
    }

    try {
        const userTicketsCollectionRef = collection(db, `users/${user.uid}/userTickets`);
        const ticketsQuery = query(userTicketsCollectionRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(ticketsQuery);

        const tableBody = document.querySelector(".title_body");
        tableBody.innerHTML = ""; // Clear existing rows

        if (querySnapshot.empty) {
            const noDataRow = document.createElement("tr");
            noDataRow.innerHTML = `<td colspan="7" style="text-align: center;">No tickets found.</td>`;
            tableBody.appendChild(noDataRow);
            return;
        }

        querySnapshot.forEach((doc) => {
            const ticketData = doc.data();
            const ticketRow = document.createElement("tr");

            const formattedTime = ticketData.timestamp
                ? new Date(ticketData.timestamp.toDate()).toLocaleString()
                : "N/A";

            ticketRow.innerHTML = `
                <td><i class="fa-solid fa-user-circle"></i></td>
                <td>${ticketData.username || "N/A"}</td>
                <td>${ticketData.ticketTitle || "Untitled"}</td>
                <td>${formattedTime}</td>
                <td>${ticketData.assignedTo || "Unassigned"}</td>
                <td></td>
                <td></td>
            `;

            tableBody.appendChild(ticketRow);
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        alert("Failed to fetch tickets.");
    }
}

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        fetchUserTickets();
    } else {
        console.log("No user signed in.");
        // Optionally redirect to the login page
        window.location.href = "/index.html";
    }
});
