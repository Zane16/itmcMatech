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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Fetch and display tickets
async function fetchAndDisplayTickets() {
    try {
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);

        const tableBody = document.querySelector(".title_body");
        tableBody.innerHTML = ""; // Clear the table

        if (usersSnapshot.empty) {
            const noTicketsRow = document.createElement("tr");
            noTicketsRow.innerHTML = `<td colspan="7">No users found</td>`;
            tableBody.appendChild(noTicketsRow);
            return;
        }

        // Iterate over each user document
        usersSnapshot.forEach(async (userDocSnapshot) => {
            const userId = userDocSnapshot.id;
            const userData = userDocSnapshot.data();
            const username = userData.username || "Anonymous";

            // Get the userTickets subcollection for each user
            const ticketsQuery = query(collection(db, "users", userId, "userTickets"));
            const ticketsSnapshot = await getDocs(ticketsQuery);

            // If no tickets found for this user, skip to the next user
            if (ticketsSnapshot.empty) return;

            // Iterate over each ticket in the userTickets subcollection
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

                let technicianUsername = "Not Assigned";
                let technicianProfileImage = "https://via.placeholder.com/50";
                if (technicianId) {
                    const technicianRef = doc(db, "users", technicianId); // Reference to the "users" collection
                    const technicianSnap = await getDoc(technicianRef);
                    if (technicianSnap.exists()) {
                        const technicianData = technicianSnap.data();
                        technicianUsername = technicianData.username || "No Username";
                        technicianProfileImage = technicianData.profileImage || "https://via.placeholder.com/50";
                    }
                }

                const newRow = document.createElement("tr");
                newRow.dataset.userId = userId; // Store the userId here for later use

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

                // Attach event listeners for the newly added buttons
                const reviewBtn = newRow.querySelector(".review-btn");
                const deleteBtn = newRow.querySelector(".delete-btn");

                // Review button click handler
                reviewBtn.addEventListener("click", handleReview);

                // Delete button click handler
                deleteBtn.addEventListener("click", handleDelete);
            });
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
    }
}

// Fetch and populate the technician dropdown
async function fetchTechnicians() {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "Technician"));
        const querySnapshot = await getDocs(q);

        const technicianSelect = document.getElementById("technicianSelect");
        technicianSelect.innerHTML = `<option value="">Choose Technician</option>`; // Reset the options
        querySnapshot.forEach((doc) => {
            const technician = doc.data();
            const technicianId = doc.id;
            const technicianName = technician.username || "Unnamed Technician";

            const technicianOption = document.createElement("option");
            technicianOption.value = technicianId;
            technicianOption.textContent = technicianName;

            technicianSelect.appendChild(technicianOption);
        });

        document.getElementById("loadingTechnicians").style.display = "none"; // Hide loading text when done
    } catch (error) {
        console.error("Error fetching technicians:", error);
    }
}

// Handle the review button click
async function handleReview(event) {
    const ticketId = event.target.dataset.ticketId;
    const username = event.target.dataset.username;
    const ticketTitle = event.target.dataset.title;
    const ticketContent = event.target.dataset.content;
    const ticketTime = event.target.dataset.time;
    const technicianUsername = event.target.dataset.technician;
    const technicianImage = event.target.dataset.technicianImage;
    const userId = event.target.closest("tr").dataset.userId; // Correctly get userId here

    // Open the modal
    const modal = document.getElementById("reviewModal");
    const closeModal = document.getElementById("closeModal");
    const confirmTechnicianButton = document.getElementById("confirmTechnicianButton");

    document.getElementById("modalUsername").textContent = username;
    document.getElementById("modalTitle").textContent = ticketTitle;
    document.getElementById("modalContent").textContent = ticketContent;
    document.getElementById("modalTimestamp").textContent = ticketTime;
    document.getElementById("modalTechnician").textContent = technicianUsername;
    document.getElementById("modalTechnicianImage").src = technicianImage;

    // Show the modal
    modal.style.display = "block";

    // Close the modal
    closeModal.onclick = () => {
        modal.style.display = "none"; 
    };


    confirmTechnicianButton.onclick = async () => {
        console.log("Confirm Technician button clicked!"); 
        const selectedTechnicianId = document.getElementById("technicianSelect").value;

        if (selectedTechnicianId) {
            try {
                const ticketRef = doc(db, "users", userId, "userTickets", ticketId);
                await updateDoc(ticketRef, { technicianId: selectedTechnicianId });
                alert("Technician assigned successfully!");
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

// Handle ticket delete
async function handleDelete(event) {
    const ticketId = event.target.dataset.ticketId;
    const ticketRef = doc(db, "users", event.target.closest("tr").dataset.userId, "userTickets", ticketId); // Correct reference to userTickets subcollection

    try {
        await deleteDoc(ticketRef);
        alert("Ticket deleted successfully!");
        fetchAndDisplayTickets(); // Refresh the ticket list
    } catch (error) {
        console.error("Error deleting ticket:", error);
        alert("Failed to delete ticket.");
    }
}

// Initialize and fetch tickets and technicians on page load
window.onload = async () => {
   
    const modal = document.getElementById("reviewModal");
    modal.style.display = "none"; 

    fetchAndDisplayTickets();
    document.getElementById("loadingTechnicians").style.display = "block"; 
    fetchTechnicians();
};
