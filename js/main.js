// ========================================
// MOBILE NAVIGATION
// ========================================

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
        const isOpen = mainNav.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", isOpen);

        if (isOpen) {
            menuToggle.textContent = "✕";
        } else {
            menuToggle.textContent = "☰";
        }
    });
}


// ========================================
// SUPABASE CONNECTION
// ========================================

const SUPABASE_URL = "https://uzuqjcceorpyxcowmrla.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GPz_XAfX7fi6q7ZxtZ7GjQ_kN41buJO";

let supabaseClient = null;

if (typeof supabase !== "undefined") {
    supabaseClient = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
}


// ========================================
// QUOTE REQUEST FORM
// ========================================

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");

if (quoteForm && supabaseClient) {

    quoteForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const submitButton =
            quoteForm.querySelector(".quote-submit-btn");


        // Clear old message
        formStatus.textContent = "";
        formStatus.className = "form-status";


        // Get form information
        const fullName =
            document.querySelector("#name").value.trim();

        const phone =
            document.querySelector("#phone").value.trim();

        const email =
            document.querySelector("#email").value.trim();

        const serviceNeeded =
            document.querySelector("#service").value;

        const projectLocation =
            document.querySelector("#location").value.trim();

        const projectDetails =
            document.querySelector("#message").value.trim();


        // Check required fields
        if (
            !fullName ||
            !phone ||
            !email ||
            !serviceNeeded ||
            !projectLocation ||
            !projectDetails
        ) {

            formStatus.textContent =
                "Please complete all fields before submitting.";

            formStatus.classList.add("error");

            return;
        }


        // Change button while submitting
        submitButton.disabled = true;
        submitButton.textContent = "Sending Request...";


        try {

            const { error } = await supabaseClient
                .from("quote_requests")
                .insert([
                    {
                        full_name: fullName,
                        phone: phone,
                        email: email,
                        service_needed: serviceNeeded,
                        project_location: projectLocation,
                        project_details: projectDetails
                    }
                ]);


            if (error) {
                throw error;
            }


            // SUCCESS MESSAGE
            formStatus.textContent =
                "✓ Thank you! Your quote request has been received. Bros K Ventures will contact you shortly.";

            formStatus.classList.add("success");


            // Clear form
            quoteForm.reset();


        } catch (error) {

            console.error(
                "Supabase quote submission error:",
                error
            );

            formStatus.textContent =
                "We could not send your request right now. Please try again.";

            formStatus.classList.add("error");

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Send Quote Request";
        }

    });
}