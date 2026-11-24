// ========================================
// SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
    "https://uzuqjcceorpyxcowmrla.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GPz_XAfX7fi6q7ZxtZ7GjQ_kN41buJO";


const resetSupabase =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ========================================
// RESET PASSWORD
// ========================================

const resetPasswordForm =
    document.querySelector(
        "#reset-password-form"
    );

const resetPasswordStatus =
    document.querySelector(
        "#reset-password-status"
    );


let recoverySessionReady =
    false;


// Supabase fires PASSWORD_RECOVERY
// after the reset email link is opened.
resetSupabase.auth.onAuthStateChange(
    function (event, session) {

        if (
            event ===
            "PASSWORD_RECOVERY"
        ) {

            recoverySessionReady =
                true;

        }

    }
);


if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const newPassword =
                document.querySelector(
                    "#reset-new-password"
                ).value;


            const confirmPassword =
                document.querySelector(
                    "#reset-confirm-password"
                ).value;


            const button =
                resetPasswordForm
                    .querySelector(
                        ".admin-login-btn"
                    );


            resetPasswordStatus.textContent =
                "";


            if (
                newPassword !==
                confirmPassword
            ) {

                resetPasswordStatus.textContent =
                    "The passwords do not match.";

                resetPasswordStatus.className =
                    "admin-login-status error";

                return;
            }


            if (
                newPassword.length < 8
            ) {

                resetPasswordStatus.textContent =
                    "Password must be at least 8 characters.";

                resetPasswordStatus.className =
                    "admin-login-status error";

                return;
            }


            // Verify recovery session exists
            const {
                data: sessionData
            } =
                await resetSupabase.auth
                    .getSession();


            if (
                !sessionData.session
            ) {

                resetPasswordStatus.textContent =
                    "This password reset link is invalid or has expired. Please request a new one.";

                resetPasswordStatus.className =
                    "admin-login-status error";

                return;
            }


            button.disabled = true;

            button.textContent =
                "Updating Password...";


            const {
                error
            } =
                await resetSupabase.auth
                    .updateUser({
                        password:
                            newPassword
                    });


            if (error) {

                console.error(
                    "Update password error:",
                    error
                );


                resetPasswordStatus.textContent =
                    "Unable to update the password. Please request a new reset link.";

                resetPasswordStatus.className =
                    "admin-login-status error";


                button.disabled = false;

                button.textContent =
                    "Update Password";

                return;
            }


            resetPasswordStatus.textContent =
                "Password updated successfully. Returning to sign in...";

            resetPasswordStatus.className =
                "admin-login-status success";


            // End recovery session
            await resetSupabase.auth
                .signOut();


            setTimeout(
                function () {

                    window.location.href =
                        "admin-login.html?reason=password-reset";

                },
                1500
            );

        }
    );

}