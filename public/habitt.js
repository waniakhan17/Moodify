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

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-link")
      .forEach((link) =>
        link.classList.remove("text-white", "font-bold", "underline")
      );
    link.classList.add("text-white", "font-bold", "underline");
  });
});

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://moodify-moodifyyyy.up.railway.app"
    : "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// Mobile menu toggle
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");
if (menuOpenButton && menuCloseButton) {
  menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
  });
  menuCloseButton.addEventListener("click", () => menuOpenButton.click());
}

const habitform = document.getElementById("habitForm");
const habitlist = document.getElementById("habitslist");


getHabits();

// ✅ Add Habit
if (habitform) {
  habitform.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("namehabit").value;
    const frequency = document.getElementById("habitfrequency").value;
    const target = parseInt(document.getElementById("habitTarget").value);
    const startDate =
      document.getElementById("habitDate").value || new Date().toISOString();
    const completedDates = [];
    const isActiveInput = document.querySelector('input[name="isActive"]');
    const isActive = isActiveInput ? isActiveInput.checked : false;
    const streak = 0;

    try {
      const response = await fetch(`${API_BASE_URL}/habit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          frequency,
          target,
          startDate,
          completedDates,
          isActive,
          streak,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        addToList(data);
        document.getElementById("message").innerHTML =
          '<div class="success bg-[#4CAF50] text-white">Habit added successfully</div>';
        habitform.reset();
        setTimeout(() => {
          document.getElementById("message").innerHTML = "";
        }, 2000);
      } else {
        const errorMessage = data.message || "Failed to add habit";
        document.getElementById(
          "message"
        ).innerHTML = `<div class="error bg-[#f44336] text-white">Error: ${errorMessage}</div>`;
      }
    } catch (err) {
      console.error(err);
      document.getElementById("message").innerHTML =
        '<div class="error bg-[#f44336] text-white">Unexpected error. Please try again.</div>';
    }
  });
}

function addToList(habit) {
  const li = document.createElement("li");
  li.className = "p-3 border rounded mb-3 bg-white shadow-sm";

  const info = document.createElement("div");
  info.className = "flex justify-between items-center";
  info.innerHTML = `
    <span class="font-medium">${habit.name}</span>
    <span class="streak text-sm text-gray-500">Streak: ${
      habit.streak || 0
    }</span>
  `;

  const slotsWrapper = document.createElement("div");
  slotsWrapper.className = "flex gap-2 mt-2 flex-wrap";

  const slots = habit.completedDates || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  slots.forEach((slotData) => {
    const slot = document.createElement("button");
    slot.textContent = new Date(slotData.date).getDate();

    slot.className =
      "w-10 h-10 border rounded-full text-sm font-medium flex items-center justify-center transition";

    const slotDate = new Date(slotData.date);
    slotDate.setHours(0, 0, 0, 0);

    if (slotData.done) {
      // ✅ Completed state
      slot.classList.remove("text-gray-800", "bg-white");
      slot.classList.add("bg-green-500", "text-white");
    } else {
      // ✅ Normal state
      slot.classList.remove("bg-green-500", "text-white");
      slot.classList.add("text-gray-800", "bg-white");
    }

    if (slotDate > today) {
      slot.disabled = true;
      slot.classList.add("bg-gray-200", "text-gray-400", "cursor-not-allowed");
    } else {
      slot.addEventListener("click", async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/habit/${habit._id}/complete`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                date: slotData.date,
                done: !slotData.done,
              }),
            }
          );
          if (response.ok) {
  const result = await response.json();
  const updatedHabit = result.updatedHabit;

  // ✅ Correct slot data update from backend
  const updatedSlot = updatedHabit.completedDates.find(
    d => new Date(d.date).toDateString() === new Date(slotData.date).toDateString()
  );
  slotData.done = updatedSlot?.done || false;

  // ✅ Reset classes before adding new ones
  slot.classList.remove("bg-white", "bg-green-500", "text-white", "text-gray-800");
  slot.classList.add(slotData.done ? "bg-green-500" : "bg-white");
  slot.classList.add(slotData.done ? "text-white" : "text-gray-800");

  // ✅ Update streak text
  li.querySelector(".streak").textContent = `Streak: ${updatedHabit.streak}`;
}


        } catch (err) {
          console.error(err);
          alert("Error updating slot.");
        }
      });
    }

    slotsWrapper.appendChild(slot);
  });

  const delBtn = document.createElement("button");
  delBtn.className =
    "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mt-2 w-fit";
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/habit/${habit._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) getHabits();
    } catch (err) {
      console.error(err);
      document.getElementById("message").innerHTML =
        '<div class="error bg-[#f44336] text-white">Unexpected error. Please try again.</div>';
    }
  });

  li.appendChild(info);
  li.appendChild(slotsWrapper);
  li.appendChild(delBtn);
  habitlist.appendChild(li);
}

function updateTotals() {
  const allHabits = document.querySelectorAll("#habitslist li");

  let totalStreaks = 0;
  let totalCompleted = 0;

  allHabits.forEach((li) => {
    const streakEl = li.querySelector(".streak");
    const streak = streakEl ? parseInt(streakEl.textContent) || 0 : 0;
    totalStreaks += streak;

    const completedSlots = li.querySelectorAll("button.bg-green-500").length;
    totalCompleted += completedSlots;
  });

  // Update totals UI
  const streaksEl = document.getElementById("streaksID");
  if (streaksEl) streaksEl.textContent = totalStreaks;

  const habitsEl = document.getElementById("habit-tracker");
  if (habitsEl) habitsEl.textContent = allHabits.length;
}


async function getHabits() {
  const response = await fetch(`${API_BASE_URL}/habit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  habitlist.innerHTML = "";
  data.forEach((habit) => addToList(habit));

  // 🔥 Call updateTotals() once after rendering all habits
  updateTotals();
}

// ✅ Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  document.getElementById("message").innerHTML =
    '<div class="error bg-yellow-600 p-2 text-white">Logging out.......</div>';
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});
