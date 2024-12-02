
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    collection, 
    query, 
    getDocs, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const auth = getAuth(app);


onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAssignedTickets(user.uid); 
    } else {
        alert("Please log in as a technician.");
    }
});


async function fetchAssignedTickets(technicianId) {
    try {
        const technicianRef = doc(db, "users", technicianId);
        const technicianSnapshot = await getDoc(technicianRef);

        if (!technicianSnapshot.exists()) {
            alert("Technician not found in the database.");
            return;
        }

        const technicianData = technicianSnapshot.data();
        if (technicianData.role !== "Technician") {
            alert("You must be logged in as a technician to view assigned tickets.");
            return;
        }

        const ticketsRef = collection(db, "users", technicianId, "assignedTickets");
        const ticketsSnapshot = await getDocs(ticketsRef);

        const ticketTableBody = document.querySelector(".title_body");
        ticketTableBody.innerHTML = ""; 

        if (ticketsSnapshot.empty) {
            const noTicketsRow = document.createElement("tr");
            noTicketsRow.innerHTML = `<td colspan="7">No tickets have been assigned to you yet.</td>`;
            ticketTableBody.appendChild(noTicketsRow);
            return;
        }

        ticketsSnapshot.forEach((ticketDoc) => {
            const ticketData = ticketDoc.data();
            const ticketId = ticketDoc.id;

            // Add a row for each ticket
            const row = document.createElement("tr");
            const profileImage = ticketData.profileImage || "https://via.placeholder.com/50";
            const ticketTime = ticketData.timestamp
                ? new Date(ticketData.timestamp.seconds * 1000).toLocaleString()
                : "Unknown Time";

            row.innerHTML = `
                <td><img src="${profileImage}" alt="Profile Image" style="border-radius: 50%; width: 50px; height: 50px;"></td>
                <td>${ticketData.username || "Unknown Client"}</td>
                <td>${ticketData.ticketTitle || "No Title"}</td>
                <td>${ticketTime}</td>
                <td>${ticketData.status || "Pending"}</td>
                <td><button class="accept-btn" data-ticket-id="${ticketId}">Accept</button></td>
                <td><button class="decline-btn" data-ticket-id="${ticketId}">Decline</button>
                </td>
            `;
            ticketTableBody.appendChild(row);


            row.querySelector(".accept-btn").addEventListener("click", () => handleAcceptTicket(technicianId, ticketId));
            row.querySelector(".decline-btn").addEventListener("click", () => handleDeclineTicket(technicianId, ticketId));
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
    }
}


async function handleAcceptTicket(technicianId, ticketId) {
    try {
        const ticketRef = doc(db, "users", technicianId, "assignedTickets", ticketId);
        await updateDoc(ticketRef, {
            status: "Accepted",
            acceptedAt: new Date()
        });
        alert("Ticket has been accepted.");
        fetchAssignedTickets(technicianId); 
    } catch (error) {
        console.error("Error accepting ticket:", error);
    }
}


async function handleDeclineTicket(technicianId, ticketId) {
    try {
        const ticketRef = doc(db, "users", technicianId, "assignedTickets", ticketId);
        await updateDoc(ticketRef, {
            status: "Declined",
            declinedAt: new Date()
        });
        alert("Ticket has been declined.");
        fetchAssignedTickets(technicianId); 
    } catch (error) {
        console.error("Error declining ticket:", error);
    }
}


window.onload = () => {
    const ticketTableBody = document.querySelector(".title_body");
    ticketTableBody.innerHTML = `<tr><td colspan="7">Loading tickets...</td></tr>`;
};
