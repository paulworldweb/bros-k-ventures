// ========================================
// SUPABASE ADMIN CONNECTION
// ========================================

const SUPABASE_URL =
    "https://uzuqjcceorpyxcowmrla.supabase.co";

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

        if (normalLoginArea) {
            normalLoginArea.style.display =
                "none";
        }


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


            passwordSetupStatus.textContent =
                "";


            // Passwords must match
            if (
                newPassword !==
                confirmPassword
            ) {

                passwordSetupStatus.textContent =
                    "The passwords do not match.";

                passwordSetupStatus.className =
                    "admin-login-status error";

                return;
            }


            // Minimum password length
            if (
                newPassword.length < 8
            ) {

                passwordSetupStatus.textContent =
                    "Password must be at least 8 characters.";

                passwordSetupStatus.className =
                    "admin-login-status error";

                return;
            }


            button.disabled =
                true;

            button.textContent =
                "Creating Password...";


            const {
                error
            } =
                await adminSupabase.auth
                    .updateUser({
                        password:
                            newPassword
                    });


            if (error) {

                console.error(
                    "Password setup error:",
                    error
                );


                passwordSetupStatus.textContent =
                    "Unable to create password. Please try again.";

                passwordSetupStatus.className =
                    "admin-login-status error";


                button.disabled =
                    false;

                button.textContent =
                    "Create Password";

                return;
            }


            passwordSetupStatus.textContent =
                "Password created successfully.";

            passwordSetupStatus.className =
                "admin-login-status success";


            setTimeout(
                function () {

                    window.location.href =
                        "admin.html";

                },
                1000
            );

        }
    );

}


// ========================================
// NORMAL ADMIN LOGIN
// ========================================

const adminLoginForm =
    document.querySelector(
        "#admin-login-form"
    );

const adminLoginStatus =
    document.querySelector(
        "#admin-login-status"
    );


// Show inactivity logout message
if (adminLoginStatus) {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    if (
        urlParams.get("reason") ===
        "inactive"
    ) {

        adminLoginStatus.textContent =
            "Your session ended because you were inactive. Please sign in again.";

        adminLoginStatus.className =
            "admin-login-status error";

    }

}


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .querySelector(
                        "#admin-email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .querySelector(
                        "#admin-password"
                    )
                    .value;


            const button =
                adminLoginForm.querySelector(
                    ".admin-login-btn"
                );


            adminLoginStatus.textContent =
                "";


            button.disabled =
                true;

            button.textContent =
                "Signing In...";


            const {
                data,
                error
            } =
                await adminSupabase.auth
                    .signInWithPassword({
                        email: email,
                        password: password
                    });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );


                adminLoginStatus.textContent =
                    "Unable to sign in. Check your email and password.";

                adminLoginStatus.className =
                    "admin-login-status error";


                button.disabled =
                    false;

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
    document.querySelector(
        "#quote-list"
    );

const dashboardStatus =
    document.querySelector(
        "#admin-dashboard-status"
    );

const totalRequests =
    document.querySelector(
        "#total-requests"
    );

const unreadRequests =
    document.querySelector(
        "#unread-requests"
    );

const archivedRequests =
    document.querySelector(
        "#archived-requests"
    );

const quoteSearch =
    document.querySelector(
        "#quote-search"
    );

const quoteStatusFilter =
    document.querySelector(
        "#quote-status-filter"
    );

const showArchived =
    document.querySelector(
        "#show-archived"
    );


let allQuotes = [];


// Load dashboard only on admin.html
if (quoteList) {

    loadAdminDashboard();

}


// ========================================
// LOAD DASHBOARD
// ========================================

async function loadAdminDashboard() {

    const {
        data: sessionData
    } =
        await adminSupabase.auth
            .getSession();


    const session =
        sessionData.session;


    // No logged-in admin
    if (!session) {

        window.location.href =
            "admin-login.html";

        return;
    }


    // ========================================
    // VERIFY ADMIN USER
    // ========================================

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

        console.error(
            "Admin verification error:",
            adminError
        );


        await adminSupabase.auth
            .signOut();


        window.location.href =
            "admin-login.html";

        return;
    }


    // ========================================
    // LOAD QUOTE REQUESTS
    // ========================================

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


        if (dashboardStatus) {

            dashboardStatus.style.display =
                "block";

            dashboardStatus.textContent =
                "Unable to load quote requests.";

        }

        return;
    }


    allQuotes =
        quotes || [];


    updateDashboardSummary();

    renderQuotes();

}


// ========================================
// DASHBOARD SUMMARY
// ========================================

function updateDashboardSummary() {

    const unreadCount =
        allQuotes.filter(
            function (quote) {

                return (
                    !quote.is_read &&
                    !quote.archived
                );

            }
        ).length;


    const archivedCount =
        allQuotes.filter(
            function (quote) {

                return (
                    quote.archived === true
                );

            }
        ).length;


    if (totalRequests) {

        totalRequests.textContent =
            allQuotes.length;

    }


    if (unreadRequests) {

        unreadRequests.textContent =
            unreadCount;

    }


    if (archivedRequests) {

        archivedRequests.textContent =
            archivedCount;

    }

}


// ========================================
// FILTER + DISPLAY QUOTES
// ========================================

function renderQuotes() {

    if (!quoteList) {
        return;
    }


    const searchValue =
        quoteSearch
            ? quoteSearch.value
                .trim()
                .toLowerCase()
            : "";


    const statusValue =
        quoteStatusFilter
            ? quoteStatusFilter.value
            : "All";


    const includeArchived =
        showArchived
            ? showArchived.checked
            : false;


    const filteredQuotes =
        allQuotes.filter(
            function (quote) {

                // ========================================
                // ARCHIVE FILTER
                // ========================================

                if (
                    !includeArchived &&
                    quote.archived === true
                ) {

                    return false;

                }


                // ========================================
                // STATUS FILTER
                // ========================================

                if (
                    statusValue !== "All" &&
                    quote.status !==
                        statusValue
                ) {

                    return false;

                }


                // ========================================
                // SEARCH
                // ========================================

                const searchableText = `
                    ${quote.full_name || ""}
                    ${quote.email || ""}
                    ${quote.phone || ""}
                    ${quote.service_needed || ""}
                    ${quote.project_location || ""}
                    ${quote.project_details || ""}
                    ${quote.admin_notes || ""}
                    ${quote.status || ""}
                `.toLowerCase();


                if (
                    searchValue &&
                    !searchableText.includes(
                        searchValue
                    )
                ) {

                    return false;

                }


                return true;

            }
        );


    quoteList.innerHTML =
        "";


    if (
        filteredQuotes.length === 0
    ) {

        if (dashboardStatus) {

            dashboardStatus.style.display =
                "block";

            dashboardStatus.textContent =
                "No matching quote requests found.";

        }

        return;
    }


    if (dashboardStatus) {

        dashboardStatus.style.display =
            "none";

    }


    filteredQuotes.forEach(
        function (quote) {

            createQuoteCard(
                quote
            );

        }
    );

}


// ========================================
// CREATE QUOTE CARD
// ========================================

function createQuoteCard(quote) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-quote-card";


    // Highlight unread requests
    if (!quote.is_read) {

        card.classList.add(
            "admin-quote-unread"
        );

    }


    const submittedDate =
        new Date(
            quote.created_at
        ).toLocaleString();


    const currentStatus =
        quote.status || "New";


    card.innerHTML = `

        <div class="admin-quote-top">

            <div>

                <div class="admin-quote-labels">

                    <span class="admin-service-label">
                        ${escapeHTML(
                            quote.service_needed
                        )}
                    </span>


                    ${
                        !quote.is_read
                            ? `
                            <span class="admin-new-badge">
                                NEW
                            </span>
                            `
                            : ""
                    }


                    ${
                        quote.archived
                            ? `
                            <span class="admin-archived-badge">
                                ARCHIVED
                            </span>
                            `
                            : ""
                    }

                </div>


                <h3>
                    ${escapeHTML(
                        quote.full_name
                    )}
                </h3>

            </div>


            <time>
                ${escapeHTML(
                    submittedDate
                )}
            </time>

        </div>


        <div class="admin-quote-details">

            <p>
                <strong>
                    Phone:
                </strong>

                ${escapeHTML(
                    quote.phone
                )}
            </p>


            <p>
                <strong>
                    Email:
                </strong>

                ${escapeHTML(
                    quote.email
                )}
            </p>


            <p>
                <strong>
                    Location:
                </strong>

                ${escapeHTML(
                    quote.project_location
                )}
            </p>

        </div>


        <div class="admin-contact-actions">

            <a
                class="admin-action-link"
                href="tel:${escapeHTML(
                    quote.phone
                )}"
            >
                Call Customer
            </a>


            <a
                class="admin-action-link"
                href="mailto:${escapeHTML(
                    quote.email
                )}"
            >
                Email Customer
            </a>

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


        <div class="admin-management-area">

            <div class="admin-management-field">

                <label>
                    Status
                </label>

                <select
                    class="admin-status-select"
                >

                    ${createStatusOptions(
                        currentStatus
                    )}

                </select>

            </div>


            <div class="admin-management-field">

                <label>
                    Private Admin Notes
                </label>

                <textarea
                    class="admin-notes-input"
                    placeholder="Add a private note about this customer..."
                >${escapeHTML(
                    quote.admin_notes || ""
                )}</textarea>


                <button
                    type="button"
                    class="admin-save-notes-btn"
                >
                    Save Notes
                </button>

            </div>


            <div class="admin-card-actions">

                <button
                    type="button"
                    class="admin-read-btn"
                >
                    ${
                        quote.is_read
                            ? "Mark as Unread"
                            : "Mark as Read"
                    }
                </button>


                <button
                    type="button"
                    class="admin-archive-btn"
                >
                    ${
                        quote.archived
                            ? "Restore Request"
                            : "Archive Request"
                    }
                </button>


                <button
                    type="button"
                    class="admin-delete-btn"
                >
                    Delete Permanently
                </button>

            </div>

        </div>
    `;


    quoteList.appendChild(
        card
    );


    // ========================================
    // STATUS CHANGE
    // ========================================

    const statusSelect =
        card.querySelector(
            ".admin-status-select"
        );


    statusSelect.addEventListener(
        "change",
        async function () {

            await updateQuote(
                quote.id,
                {
                    status:
                        statusSelect.value
                }
            );

        }
    );


    // ========================================
    // SAVE PRIVATE NOTES
    // ========================================

    const notesInput =
        card.querySelector(
            ".admin-notes-input"
        );


    const saveNotesButton =
        card.querySelector(
            ".admin-save-notes-btn"
        );


    saveNotesButton.addEventListener(
        "click",
        async function () {

            saveNotesButton.disabled =
                true;

            saveNotesButton.textContent =
                "Saving...";


            const success =
                await updateQuote(
                    quote.id,
                    {
                        admin_notes:
                            notesInput.value
                                .trim()
                    }
                );


            if (!success) {

                saveNotesButton.disabled =
                    false;

                saveNotesButton.textContent =
                    "Save Notes";

            }

        }
    );


    // ========================================
    // MARK READ / UNREAD
    // ========================================

    const readButton =
        card.querySelector(
            ".admin-read-btn"
        );


    readButton.addEventListener(
        "click",
        async function () {

            await updateQuote(
                quote.id,
                {
                    is_read:
                        !quote.is_read
                }
            );

        }
    );


    // ========================================
    // ARCHIVE / RESTORE
    // ========================================

    const archiveButton =
        card.querySelector(
            ".admin-archive-btn"
        );


    archiveButton.addEventListener(
        "click",
        async function () {

            await updateQuote(
                quote.id,
                {
                    archived:
                        !quote.archived
                }
            );

        }
    );


    // ========================================
    // PERMANENTLY DELETE REQUEST
    // ========================================

    const deleteButton =
        card.querySelector(
            ".admin-delete-btn"
        );


    deleteButton.addEventListener(
        "click",
        async function () {

            const confirmed =
                window.confirm(
                    "Permanently delete this quote request from " +
                    quote.full_name +
                    "? This cannot be undone."
                );


            if (!confirmed) {

                return;

            }


            deleteButton.disabled =
                true;

            deleteButton.textContent =
                "Deleting...";


            const {
                error
            } =
                await adminSupabase
                    .from(
                        "quote_requests"
                    )
                    .delete()
                    .eq(
                        "id",
                        quote.id
                    );


            if (error) {

                console.error(
                    "Delete request error:",
                    error
                );


                alert(
                    "Unable to delete this request."
                );


                deleteButton.disabled =
                    false;

                deleteButton.textContent =
                    "Delete Permanently";

                return;
            }


            await loadAdminDashboard();

        }
    );

}


// ========================================
// STATUS OPTIONS
// ========================================

function createStatusOptions(
    currentStatus
) {

    const statuses = [
        "New",
        "Contacted",
        "Quote Sent",
        "Approved",
        "Closed"
    ];


    return statuses
        .map(
            function (status) {

                const selected =
                    status ===
                    currentStatus
                        ? "selected"
                        : "";


                return `
                    <option
                        value="${status}"
                        ${selected}
                    >
                        ${status}
                    </option>
                `;

            }
        )
        .join("");

}


// ========================================
// UPDATE QUOTE
// ========================================

async function updateQuote(
    quoteId,
    changes
) {

    const {
        error
    } =
        await adminSupabase
            .from(
                "quote_requests"
            )
            .update(
                changes
            )
            .eq(
                "id",
                quoteId
            );


    if (error) {

        console.error(
            "Quote update error:",
            error
        );


        alert(
            "Unable to update this request."
        );


        return false;

    }


    await loadAdminDashboard();


    return true;

}


// ========================================
// SEARCH / FILTER EVENTS
// ========================================

if (quoteSearch) {

    quoteSearch.addEventListener(
        "input",
        function () {

            renderQuotes();

        }
    );

}


if (quoteStatusFilter) {

    quoteStatusFilter.addEventListener(
        "change",
        function () {

            renderQuotes();

        }
    );

}


if (showArchived) {

    showArchived.addEventListener(
        "change",
        function () {

            renderQuotes();

        }
    );

}


// ========================================
// ADMIN INACTIVITY AUTO LOGOUT
// ========================================

let inactivityTimer;


// 15 minutes
const INACTIVITY_LIMIT =
    15 * 60 * 1000;


// Restart inactivity timer
function resetInactivityTimer() {

    clearTimeout(
        inactivityTimer
    );


    inactivityTimer =
        setTimeout(
            logoutForInactivity,
            INACTIVITY_LIMIT
        );

}


// Sign out after inactivity
async function logoutForInactivity() {

    await adminSupabase.auth
        .signOut();


    window.location.href =
        "admin-login.html?reason=inactive";

}


// Only run inactivity timer
// on the admin dashboard
if (quoteList) {

    const activityEvents = [
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "click"
    ];


    activityEvents.forEach(
        function (eventName) {

            document.addEventListener(
                eventName,
                resetInactivityTimer,
                {
                    passive: true
                }
            );

        }
    );


    resetInactivityTimer();

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

            adminLogoutBtn.disabled =
                true;

            adminLogoutBtn.textContent =
                "Signing Out...";


            await adminSupabase.auth
                .signOut();


            window.location.href =
                "admin-login.html";

        }
    );

}


// ========================================
// SECURITY HELPER
// Prevent customer-entered HTML or
// JavaScript from being executed.
// ========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}