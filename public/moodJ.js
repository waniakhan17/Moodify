document.addEventListener("DOMContentLoaded", () => {
  // Get current page URL
  const currentPage = window.location.pathname.split("/").pop();

  // Select all nav links
  document.querySelectorAll(".nav-link").forEach(link => {
    // If link href matches current page, add active style
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("text-white", "font-bold", "underline");
    }
  });


const isProd = window.location.hostname !== "localhost";

const API_BASE_URL = isProd
  ? "https://moodify-moodifyyyy.up.railway.app"
  : "http://localhost:5000";

console.log("API Base URL:", API_BASE_URL);
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const menuOpenButton = document.querySelector("#menu-open-button");
  const menuCloseButton = document.querySelector("#menu-close-button");

  if (menuOpenButton && menuCloseButton) {
    menuOpenButton.addEventListener("click", () => {
      document.body.classList.toggle("show-mobile-menu");
    });
    menuCloseButton.addEventListener("click", () => menuOpenButton.click());
  }

  const timelabel = document.getElementById("timeLabel"); //to display the date to user
  const datefield = document.getElementById("dateField"); //to send the date to backend
  const input = document.querySelectorAll('input[name="moodScore"]');
  const emojifield = document.getElementById("emojiField");
  const moodForm = document.getElementById("moodForm");

  const scoreEmoji = { 1: "😥", 2: "☹️", 3: "😐", 4: "🙂", 5: "😄" };
  //for date
  const today = new Date();
  if (timelabel)
    timelabel.textContent = today.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  if (datefield) datefield.value = today.toISOString();

  //for inputs radio
  input.forEach((radio)=> {
    radio.addEventListener("change", () => {
      if (emojifield) emojifield.value = scoreEmoji[radio.value] || ""; //radio value is 1-5
    });
  });

  if (moodForm) {
    moodForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const selectedRadio = document.querySelector(
        'input[name="moodScore"]:checked'
      );
      if (!selectedRadio) {
        document.getElementById("message").innerHTML =
          '<div class="error bg-[#f44336] text-white">Please select a mood before submitting!</div>';
        return;
      }

      //collecting the input values/information from the form
      const formData = new FormData(event.target); //FormData collects the input values from form into an obj
      const plainFormData = Object.fromEntries(formData); //connverts the data into objects
      plainFormData.moodScore = Number(plainFormData.moodScore); //converts the string in to number
      plainFormData.emoji = scoreEmoji[plainFormData.moodScore]; //to find the emoji matches the selected score

      try {
        const response = await fetch(`${API_BASE_URL}/mood`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(plainFormData),
        });
        const data = await response.json();

        document.getElementById("message").innerHTML = "";
        if (response.ok) {
          document.getElementById("message").innerHTML =
            '<div class="success bg-[#4CAF50] text-white">Entry entered successfully</div>';

          moodForm.reset(); // Clear form fields
          setTimeout(() => {
            document.getElementById("message").innerHTML = "";
          }, 2000);
        } else {
          const errorMessage = data.message || "Entry failed";
          document.getElementById(
            "message"
          ).innerHTML = `<div class="error bg-[#f44336] text-white">Entry failed: ${errorMessage}</div>`;
        }
      } catch (err) {
        console.error(err);
        document.getElementById("message").innerHTML =
          '<div class="error bg-[#f44336] text-white">An unexpected error occurred. Please try again.</div>';
      }
    });
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    document.getElementById("message").innerHTML =
      '<div class="error bg-yellow-600 p-2 text-white">Logging out.......</div>';

    // Redirect to landing page
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  });
});
