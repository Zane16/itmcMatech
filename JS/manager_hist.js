import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    getDocs,
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDe5nZSDQ-N5gTuoL2r7Q-9Z0oh7C_pc-k",
    authDomain: "matech-01.firebaseapp.com",
    projectId: "matech-01",
    storageBucket: "matech-01.appspot.com",
    messagingSenderId: "600983949439",
    appId: "1:600983949439:web:7ba30458ad99758c87af4a",
    measurementId: "G-MYLH77L240",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchManagerHistory() {
    const managerId = "manager123";  // Example manager ID for testing
    console.log("Fetching history for manager:", managerId); 

    try {
        const historyQuery = query(collection(db, "users", managerId, "history"));
        const historySnapshot = await getDocs(historyQuery);

        if (historySnapshot.empty) {
            console.log("No tickets found in manager's history.");
            return;
        }

        const historyTableBody = document.querySelector(".title_body");
        historyTableBody.innerHTML = ""; // Clear the table first

        historySnapshot.forEach(async (ticketDocSnapshot) => {
            const ticket = ticketDocSnapshot.data();
            const ticketId = ticketDocSnapshot.id;
            console.log("Ticket Data:", ticket);

            const profileImage = ticket.profileImage || "https://via.placeholder.com/50";
            const ticketTitle = ticket.ticketTitle || "No Title";
            const ticketContent = ticket.ticketContent || "No Content Provided";
            const ticketTime = ticket.timestamp ? new Date(ticket.timestamp.seconds * 1000).toLocaleString() : "Unknown Time";
            const technicianId = ticket.technicianId;  // Assume 'technicianId' is stored in ticket
            const userUsername = ticket.username || "Unknown User";  // Assuming 'username' is in the ticket data

            // Fetch technician username using technicianId
            let technicianUsername = "Not Assigned";
            if (technicianId) {
                try {
                    const technicianRef = doc(db, "users", technicianId);
                    const technicianSnap = await getDoc(technicianRef);
                    
                    if (technicianSnap.exists()) {
                        const technicianData = technicianSnap.data();
                        technicianUsername = technicianData.username || "No Username"; // Assuming technician's username is in 'username'
                        console.log("Technician Data:", technicianData); // Debugging: Log technician data
                    } else {
                        console.log("No technician found for ID:", technicianId);  // Debugging: Technician not found
                    }
                } catch (error) {
                    console.error("Error fetching technician details:", error);
                }
            }

            // Create a new row for each ticket
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><img src="${profileImage}" alt="Profile Image" style="border-radius: 50%; width: 50px; height: 50px;"></td>
                <td>${userUsername}</td>
                <td>${ticketTitle}</td>
                <td>${ticketTime}</td>
                <td>${technicianUsername}</td> 
                <td>${ticket.status || "Pending"}</td>
                <td></td>
        
            `;
            historyTableBody.appendChild(newRow);

            console.log("Ticket added to table:", ticketTitle);
        });
    } catch (error) {
        console.error("Error fetching manager history:", error);
    }
}

window.onload = async () => {
    console.log("Page loaded, fetching manager history...");
    fetchManagerHistory();
};
