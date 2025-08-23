function addActive() {
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("text-white", "font-bold", "underline");

    if (link.getAttribute("href") === currentPage) {
      link.classList.add("text-white", "font-bold", "underline");
    }
  });
}
addActive();

// highlight when clicking too
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("text-white", "font-bold", "underline"));
    link.classList.add("text-white", "font-bold", "underline");
  });
});

const API_BASE_URL = "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// mobile menu
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

if (menuOpenButton && menuCloseButton) {
  menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
  });
  menuCloseButton.addEventListener("click", () => menuOpenButton.click());
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/stats`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    // moods
    const moodLabels = Object.keys(data.moodCounts); 
    const moodValues = Object.values(data.moodCounts); 

    // stats
    document.getElementById("journalCount").innerText = data.journalCount;
    document.getElementById("totalHabits").innerText = data.habit.length;

    if (moodValues.length > 0) {
      document.getElementById("topMood").innerText =
        moodLabels[moodValues.indexOf(Math.max(...moodValues))];
    } else {
      document.getElementById("topMood").innerText = "No moods yet";
    }

    // charts
    moodChart(moodLabels, moodValues);
    habitChart(data.habit);
    journalChart(moodLabels, moodValues);
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
});

// Mood chart
function moodChart(labels, values) {
  const ctx = document.getElementById("moodChart");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4caf50", "#af478c"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

// Habit chart
function habitChart(habit) {
  const ctx = document.getElementById("habitChart");
  const labels = habit.map((h) => h.name);
  const values = habit.map((h) =>
    h.completedDates ? h.completedDates.length : 0
  );

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Completed",
          data: values,
          backgroundColor: "#af478c",
        },
      ],
    },
    options: { responsive: true },
  });
}

// Journal chart
function journalChart(labels, values) {
  const ctx = document.getElementById("JournalChart");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Journal",
          data: values,
          borderColor: "#36a2eb",
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
    },
  });
}
  document.getElementById("logoutBtn").addEventListener("click", () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    document.getElementById("message").innerHTML = '<div class="error bg-yellow-600 p-2 text-white">Logging out.......</div>';

    // Redirect to landing page
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  });
  document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  document.getElementById("message").innerHTML =
    '<div class="error bg-yellow-600 p-2 text-white">Logging out.......</div>';
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});