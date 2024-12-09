import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    where,
    addDoc,
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

// Fetch and Display Client Tickets
async function fetchAndDisplayTickets() {
    try {
        const usersQuery = query(collection(db, "users"), where("role", "==", "Client"));
        const usersSnapshot = await getDocs(usersQuery);

        const tableBody = document.querySelector(".title_body");
        tableBody.innerHTML = ""; // Clear the table

        if (usersSnapshot.empty) {
            const noTicketsRow = document.createElement("tr");
            noTicketsRow.innerHTML = `<td colspan="7">No users found</td>`;
            tableBody.appendChild(noTicketsRow);
            return;
        }

        usersSnapshot.forEach(async (userDocSnapshot) => {
            const userId = userDocSnapshot.id;
            const userData = userDocSnapshot.data();
            const username = userData.username || "Anonymous";

            const ticketsQuery = query(collection(db, "users", userId, "userTickets"));
            const ticketsSnapshot = await getDocs(ticketsQuery);

            if (ticketsSnapshot.empty) return; // Skip if no tickets for the client

            ticketsSnapshot.forEach(async (ticketDocSnapshot) => {
                const ticket = ticketDocSnapshot.data();
                const ticketId = ticketDocSnapshot.id;
                const profileImage = ticket.profileImage || "https://via.placeholder.com/50";
                const ticketTitle = ticket.ticketTitle || "No Title";
                const ticketContent = ticket.ticketContent || "No Content Provided";
                const ticketTime = ticket.timestamp
                    ? new Date(ticket.timestamp.seconds * 1000).toLocaleString()
                    : "Unknown Time";
                const technicianId = ticket.technicianId;

                // Fetch technician details if assigned
                let technicianUsername = "Not Assigned";
                let technicianProfileImage = "https://via.placeholder.com/50";
                if (technicianId) {
                    const technicianRef = doc(db, "users", technicianId);
                    const technicianSnap = await getDoc(technicianRef);
                    if (technicianSnap.exists()) {
                        const technicianData = technicianSnap.data();
                        technicianUsername = technicianData.username || "No Username";
                        technicianProfileImage = technicianData.profileImage || "https://via.placeholder.com/50";
                    }
                }

                // Create new row for the ticket
                const newRow = document.createElement("tr");
                newRow.dataset.userId = userId; // Store userId in the row for reference

                newRow.innerHTML = `
                    <td><img src="${profileImage}" alt="Profile Image" style="border-radius: 50%; width: 50px; height: 50px;"></td>
                    <td>${username}</td>
                    <td>${ticketTitle}</td>
                    <td>${ticketTime}</td>
                    <td>${technicianUsername}</td>
                    <td>
                        <button class="review-btn" 
                            data-ticket-id="${ticketId}" 
                            data-title="${ticketTitle}" 
                            data-content="${ticketContent}" 
                            data-username="${username}" 
                            data-time="${ticketTime}" 
                            data-technician="${technicianUsername}" 
                            data-technician-image="${technicianProfileImage}">
                            Review
                        </button>
                    </td>
                    <td>
                        <button class="delete-btn" data-ticket-id="${ticketId}">Delete</button>
                    </td>
                `;

                tableBody.appendChild(newRow);

                const reviewBtn = newRow.querySelector(".review-btn");
                const deleteBtn = newRow.querySelector(".delete-btn");

                reviewBtn.addEventListener("click", handleReview);
                deleteBtn.addEventListener("click", handleDelete);
            });
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
    }
}

// Fetch Technicians for Assignment
async function fetchTechnicians() {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "Technician"));
        const querySnapshot = await getDocs(q);

        const technicianSelect = document.getElementById("technicianSelect");
        technicianSelect.innerHTML = `<option value="">Choose Technician</option>`;
        querySnapshot.forEach((doc) => {
            const technician = doc.data();
            const technicianId = doc.id;
            const technicianName = technician.username || "Unnamed Technician";

            const technicianOption = document.createElement("option");
            technicianOption.value = technicianId;
            technicianOption.textContent = technicianName;

            technicianSelect.appendChild(technicianOption);
        });

        document.getElementById("loadingTechnicians").style.display = "none"; // Hide loading spinner
    } catch (error) {
        console.error("Error fetching technicians:", error);
    }
}

async function handleReview(event) {
    const ticketId = event.target.dataset.ticketId;
    const username = event.target.dataset.username;
    const ticketTitle = event.target.dataset.title;
    const ticketContent = event.target.dataset.content;
    const ticketTime = event.target.dataset.time;
    const technicianUsername = event.target.dataset.technician;
    const technicianImage = event.target.dataset.technicianImage;
    const userId = event.target.closest("tr").dataset.userId;

    const modal = document.getElementById("reviewModal");
    const closeModal = document.getElementById("closeModal");
    const confirmTechnicianButton = document.getElementById("confirmTechnicianButton");

    document.getElementById("modalUsername").textContent = username;
    document.getElementById("modalTitle").textContent = ticketTitle;
    document.getElementById("modalContent").textContent = ticketContent;
    document.getElementById("modalTimestamp").textContent = ticketTime;
    document.getElementById("modalTechnician").textContent = technicianUsername;
    document.getElementById("modalTechnicianImage").src = technicianImage;

    modal.style.display = "block";

    closeModal.onclick = () => {
        modal.style.display = "none"; 
    };

    confirmTechnicianButton.onclick = async () => {
        const selectedTechnicianId = document.getElementById("technicianSelect").value;

        if (selectedTechnicianId) {
            try {
                const ticketRef = doc(db, "users", userId, "userTickets", ticketId);
                const ticketSnapshot = await getDoc(ticketRef);

                if (!ticketSnapshot.exists()) {
                    alert("Ticket not found.");
                    return;
                }

                const ticketData = ticketSnapshot.data();

                
                await updateDoc(ticketRef, { technicianId: selectedTechnicianId, status: "Assigned" });

                
                await addDoc(collection(db, "users", selectedTechnicianId, "assignedTickets"), ticketData);

                
                const managerId = "manager123"; 
                await addDoc(collection(db, "users", managerId, "history"), ticketData);

                alert("Technician assigned and ticket saved to history successfully!");
                fetchAndDisplayTickets(); 
                modal.style.display = "none"; 
            } catch (error) {
                console.error("Error assigning technician:", error);
                alert("Failed to assign technician.");
            }
        } else {
            alert("Please select a technician.");
        }
    };
}


async function handleDelete(event) {
    const ticketId = event.target.dataset.ticketId;
    const ticketRef = doc(db, "users", event.target.closest("tr").dataset.userId, "userTickets", ticketId);

    try {
        await deleteDoc(ticketRef); 
        alert("Ticket deleted successfully!");
        fetchAndDisplayTickets(); 
    } catch (error) {
        console.error("Error deleting ticket:", error);
        alert("Failed to delete ticket.");
    }
}

window.onload = async () => {
    const modal = document.getElementById("reviewModal");
    modal.style.display = "none"; // Hide modal initially

    fetchAndDisplayTickets(); // Load tickets
    document.getElementById("loadingTechnicians").style.display = "block"; // Show loading spinner
    fetchTechnicians(); // Fetch technicians
};
