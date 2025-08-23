//login. user
const loginEmail = document.getElementById("emailID");
const loginPassword = document.getElementById("passwordID");
const loginBtn = document.getElementById("loginB");
const API_BASE_URL = "http://localhost:5000"; 


if (loginBtn) {
  loginBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!loginEmail || !loginPassword || 
        loginEmail.value.trim() === "" || 
        loginPassword.value.trim() === "") {
      document.getElementById("message").innerHTML =
        `<div class="error bg-yellow-600 text-center text-white">Complete the login form</div>`;
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.value.trim(),
          password: loginPassword.value.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        document.getElementById("message").innerHTML =
        '<div class="success bg-[#4CAF50] text-white">Login successful! Redirecting to dashboard...</div>';
      setTimeout(() => {
        window.location.href = 'app.html';
      }, 2000);
      } else {
         const errorMessage = data.message || "Login failed";
      document.getElementById("message").innerHTML =
        `<div class="error bg-[#f44336] text-white">Login failed: ${errorMessage}</div>`;
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  });
}