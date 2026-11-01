// ========================================
// SUPABASE ADMIN CONNECTION
// ========================================

const SUPABASE_URL = "https://uzuqjcceorpyxcowmrla.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GPz_XAfX7fi6q7ZxtZ7GjQ_kN41buJO";

const adminSupabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ========================================
// FIRST-TIME ADMIN INVITATION
// ========================================

const normalLoginArea =
    document.querySelector("#normal-login-area");

const passwordSetupArea =
    document.querySelector("#password-setup-area");

const passwordSetupForm =
    document.querySelector("#password-setup-form");

const passwordSetupStatus =
    document.querySelector("#password-setup-status");


async function checkForInvitation() {

    if (!passwordSetupArea) {
        return;
    }

    // Supabase invitation links include type=invite
    const hashParams =
        new URLSearchParams(
            window.location.hash.substring(1)
        );

    const isInvitation =
        hashParams.get("type") === "invite";


    if (!isInvitation) {
        return;
    }


    const {
        data: sessionData
    } =
        await adminSupabase.auth.getSession();


    const session =
        sessionData.session;


    if (session) {

        normalLoginArea.style.display =
            "none";

        passwordSetupArea.style.display =
            "block";
    }

}


checkForInvitation();


// ========================================
// CREATE PASSWORD FOR INVITED ADMIN
// ========================================

if (passwordSetupForm) {

    passwordSetupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const newPassword =
                document.querySelector(
                    "#new-admin-password"
                ).value;


            const confirmPassword =
                document.querySelector(
                    "#confirm-admin-password"
                ).value;


            const button =
                passwordSetupForm.querySelector(
                    ".admin-login-btn"
                );


            passwordSetupStatus.textContent = "";


            // Make sure passwords match
            if (newPassword !== confirmPassword) {

                passwordSetupStatus.textContent =
                    "The passwords do not match.";

                passwordSetupStatus.className =
                    "admin-login-status error";

                return;
            }


            // Require at least 8 characters
            if (newPassword.length < 8) {

                passwordSetupStatus.textContent =
                    "Password must be at least 8 characters.";

                passwordSetupStatus.className =
                    "admin-login-status error";

                return;
            }


            button.disabled = true;

            button.textContent =
                "Creating Password...";


            const { error } =
                await adminSupabase.auth.updateUser({
                    password: newPassword
                });


            if (error) {

                passwordSetupStatus.textContent =
                    "Unable to create password. Please try again.";

                passwordSetupStatus.className =
                    "admin-login-status error";

                button.disabled = false;

                button.textContent =
                    "Create Password";

                return;
            }


            passwordSetupStatus.textContent =
                "Password created successfully.";

            passwordSetupStatus.className =
                "admin-login-status success";


            // Take admin to dashboard
            setTimeout(function () {

                window.location.href =
                    "admin.html";

            }, 1000);

        }
    );
}


// ========================================
// NORMAL ADMIN LOGIN
// ========================================

const adminLoginForm =
    document.querySelector("#admin-login-form");

const adminLoginStatus =
    document.querySelector("#admin-login-status");


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .querySelector("#admin-email")
                    .value
                    .trim();


            const password =
                document
                    .querySelector("#admin-password")
                    .value;


            const button =
                adminLoginForm.querySelector(
                    ".admin-login-btn"
                );


            adminLoginStatus.textContent = "";


            button.disabled = true;

            button.textContent =
                "Signing In...";


            const { data, error } =
                await adminSupabase.auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            if (error) {

                adminLoginStatus.textContent =
                    "Unable to sign in. Check your email and password.";

                adminLoginStatus.className =
                    "admin-login-status error";

                button.disabled = false;

                button.textContent =
                    "Sign In";

                return;
            }


            if (data.user) {

                window.location.href =
                    "admin.html";
            }

        }
    );
}


// ========================================
// ADMIN DASHBOARD
// ========================================

const quoteList =
    document.querySelector("#quote-list");

const dashboardStatus =
    document.querySelector(
        "#admin-dashboard-status"
    );

const totalRequests =
    document.querySelector("#total-requests");


if (quoteList) {

    loadAdminDashboard();

}


async function loadAdminDashboard() {

    const {
        data: sessionData
    } =
        await adminSupabase.auth.getSession();


    const session =
        sessionData.session;


    // If nobody is signed in,
    // return to login page
    if (!session) {

        window.location.href =
            "admin-login.html";

        return;
    }


    // Check that the signed-in user
    // is listed in admin_users
    const {
        data: adminRecord,
        error: adminError
    } =
        await adminSupabase
            .from("admin_users")
            .select("user_id")
            .eq(
                "user_id",
                session.user.id
            )
            .maybeSingle();


    if (
        adminError ||
        !adminRecord
    ) {

        await adminSupabase.auth.signOut();

        window.location.href =
            "admin-login.html";

        return;
    }


    // Get quote requests
    const {
        data: quotes,
        error
    } =
        await adminSupabase
            .from("quote_requests")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Quote request error:",
            error
        );

        dashboardStatus.textContent =
            "Unable to load quote requests.";

        return;
    }


    totalRequests.textContent =
        quotes.length;


    if (quotes.length === 0) {

        dashboardStatus.textContent =
            "No quote requests have been submitted yet.";

        return;
    }


    dashboardStatus.style.display =
        "none";


    quoteList.innerHTML = "";


    quotes.forEach(function (quote) {

        const card =
            document.createElement("article");


        card.className =
            "admin-quote-card";


        const submittedDate =
            new Date(
                quote.created_at
            ).toLocaleString();


        card.innerHTML = `
            <div class="admin-quote-top">

                <div>

                    <span class="admin-service-label">
                        ${escapeHTML(
                            quote.service_needed
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            quote.full_name
                        )}
                    </h3>

                </div>

                <time>
                    ${submittedDate}
                </time>

            </div>


            <div class="admin-quote-details">

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(quote.phone)}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(quote.email)}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${escapeHTML(
                        quote.project_location
                    )}
                </p>

            </div>


            <div class="admin-project-message">

                <strong>
                    Project Details
                </strong>

                <p>
                    ${escapeHTML(
                        quote.project_details
                    )}
                </p>

            </div>
        `;


        quoteList.appendChild(card);

    });

}


// ========================================
// ADMIN LOGOUT
// ========================================

const adminLogoutBtn =
    document.querySelector(
        "#admin-logout-btn"
    );


if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        async function () {

            await adminSupabase.auth.signOut();

            window.location.href =
                "admin-login.html";

        }
    );
}


// ========================================
// SECURITY HELPER
// ========================================

function escapeHTML(value) {

    if (!value) {
        return "";
    }


    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}