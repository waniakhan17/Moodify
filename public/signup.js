const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://moodify-moodifyyyy.up.railway.app"
    : "http://localhost:5000";

const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  registerUser();
});

async function registerUser() {
  const username = document.getElementById("namee").value;
  const email = document.getElementById("emaill").value;
  const password = document.getElementById("passwordd").value;
  const password_confirm = document.getElementById("confirmpasswordd").value;
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;

  if (password !== password_confirm) {
    document.getElementById("message").innerHTML =
        `<div class="error bg-[#f44336] text-center text-white">Password do not match</div>`;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        confirm_password: password_confirm,
        gender,
        dob,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("message").innerHTML =
        '<div class="success bg-[#4CAF50] text-white">Registration successful! Redirecting to login page...</div>';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      const errorMessage = data.message || "Registration failed";
      document.getElementById("message").innerHTML =
        `<div class="error bg-[#f44336] text-white">Registration failed: ${errorMessage}</div>`;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerHTML =
      '<div class="error bg-[#f44336] text-white">An unexpected error occurred. Please try again.</div>';
  }
}
