import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
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

let ticket_title = document.getElementById('ticket_title');
let ticket_body = document.getElementById('ticket_body');
let submit_btn = document.getElementById('submit_btn');

async function AddData() {
    if (!ticket_title.value || !ticket_body.value) {
        alert("Please fill in all fields!");
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("User not authenticated.");
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid); // Access the user's document in the "users" collection
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            alert("User data not found.");
            return;
        }

        const username = userDoc.data().username;
        const role = userDoc.data().role; // Check the role of the user

        // Define the ticket data object
        const ticketData = {
            ticketTitle: ticket_title.value,
            ticketContent: ticket_body.value,
            timestamp: serverTimestamp(),
            username: username,
            status: "submitted", // Track status as submitted
            submittedBy: user.uid, // Store who submitted the ticket
            role: role // Save the role for reference
        };

        // Add the ticket to the user's sub-collection "userTickets" inside their document
        const userTicketsCollectionRef = collection(db, `users/${user.uid}/userTickets`);
        const ticketRef = await addDoc(userTicketsCollectionRef, ticketData);
        console.log("Ticket added to user's userTickets sub-collection:", ticketRef.id);

        // If the user is a client, we also want to add the ticket to managers' documents
        if (role === "Client") {
            // Query to find all users with the role of "Manager"
            const managersQuery = query(collection(db, "users"), where("role", "==", "Manager"));
            const managersSnapshot = await getDocs(managersQuery);

            if (managersSnapshot.empty) {
                console.log("No managers found in the database.");
                return;
            }

            // Add the ticket to each manager's "userTickets" sub-collection
            managersSnapshot.forEach(async (managerDoc) => {
                const managerUid = managerDoc.id; // Get manager's UID

                console.log("Adding ticket to manager's document for UID:", managerUid);

                // Add the ticket to the manager's userTickets sub-collection
                const managerTicketsCollectionRef = collection(db, `users/${managerUid}/userTickets`);
                await addDoc(managerTicketsCollectionRef, ticketData);

                console.log("Ticket added to manager's userTickets sub-collection.");
            });
        }

        alert("Ticket submitted successfully.");
        // Clear the input fields
        ticket_title.value = "";
        ticket_body.value = "";
    } catch (error) {
        console.error("Error adding ticket:", error);
        alert("Failed to submit ticket.");
    }
}

submit_btn.addEventListener('click', AddData);
