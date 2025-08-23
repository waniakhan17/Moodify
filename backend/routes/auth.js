
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Mood = require("../models/Mood");
const Habit = require("../models/habit");
const journal = require("../models/journal");
const authMiddleware = require("../middleware/auth");

//register user
router.post("/signup", async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      email: req.body.email,
    });
    if (existingUser) {
      res.status(400).json({ msg: "User already exist" });
    }
    // If user does not exist, create a new user
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      gender: req.body.gender,
      dob: req.body.dob,
    });
    const saveUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully", saveUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
});

//login user
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    const password = req.body.password;
    const isMatched = bcrypt.compareSync(password, user.password);
    if (isMatched) {
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token,
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

//logout user
router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});
//mood
router.post("/mood", authMiddleware, async (req, res) => {
  try {
    const newMood = new Mood({
      moodScore: req.body.moodScore,
      emoji: req.body.emoji,
      note: req.body.note,
      user: req.user.id,
    });
    const saveMood = await newMood.save();
    res.status(201).json({ message: "Mood successfully saved", saveMood });
  } catch (err) {
    res.status(500).json({ message: "Error saving moods", error: err.message });
  }
});
//get all moods for a user
// router.get("/mood", authMiddleware, async (req, res) => {
//   try {
//     const Moods = await Mood.find({ user: req.user.id }).sort({
//       date: -1,
//     });
//     res.status(200).json(Moods);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving moods", error: err.message });
//   }
// });

// //save journal entries for a user
// router.post("/journal", authMiddleware, async (req, res) => {
//   try {
//     const newJournal = new journal({
//       user: req.user.id,
//       title: req.body.title,
//       description: req.body.description,
//     });
//     const saveJournal = await newJournal.save();
//     res
//       .status(201)
//       .json({ message: "Journal successfully saved", saveJournal });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error saving journals", error: err.message });
//   }
// });

// //get journal entries
// router.get("/journal", authMiddleware, async (req, res) => {
//   try {
//     // Retrieve all journal entries for the authenticated user
//     const journals = await journal.find({ user: req.user.id  }).sort({
//       date: -1,
//     });

//     //retrieve all the journal entries based on mood
//     const moodEntries = await journal.find({user: req.user.id }).populate("mood","emoji note").sort({date:-1});

//     //retrieve all the journal entries based on dates
//     const dateEntries=await journal.find({user: req.user.id }).sort({date:-1});

//     res.status(200).json({ journals, moodEntries, dateEntries });

//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving journals", error: err.message });
//   }
// });

//updating habits
// PUT /habit/:id/complete

router.put("/habit/:id/complete", authMiddleware, async (req, res) => {
  try {
    const { date, done } = req.body;
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ msg: "Habit not found" });

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // existing date check
    const existing = (habit.completedDates || []).find(d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === targetDate.getTime();
    });

    if (existing) existing.done = done;
    else habit.completedDates = [...(habit.completedDates || []), { date: targetDate, done }];

    // inline streak calculation
    const completed = (habit.completedDates || []).filter(d => d.done).sort((a, b) => new Date(a.date) - new Date(b.date));
    let streak = 0, maxStreak = 0;
    for (let i = 0; i < completed.length; i++) {
      if (i === 0) streak = 1;
      else {
        const prev = new Date(completed[i - 1].date);
        const curr = new Date(completed[i].date);
        streak = ((curr - prev) / (1000 * 60 * 60 * 24) === 1) ? streak + 1 : 1;
      }
      if (streak > maxStreak) maxStreak = streak;
    }
    habit.streak = maxStreak;

    await habit.save();
    res.json({ updatedHabit: habit });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});



//get all habits for a user
router.get("/habit", authMiddleware, async (req, res) => {
  try {
    const habitss = await Habit.find({ user: req.user.id }).sort({
      startDate: -1,
    });
    res.status(200).json(habitss);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving habits", error: err.message });
  }
});
//create a new habit
router.post("/habit", authMiddleware, async (req, res) => {
  try {
    let completedDates = [];
    const frequency = req.body.frequency; // frequency nikal lo request se
   const target=req.body.target;
    const today = new Date();

    if (frequency === "Daily") {
      for (let i = 0; i < target; i++) {
        let d = new Date(today);
        d.setDate(today.getDate() + i);
        completedDates.push({ date: d, done: false }); 
      }
    } 
    else if (frequency === "Weekly") {
      for (let i = 0; i < target; i++) {
        let d = new Date(today);
        d.setDate(today.getDate() + i * 7); // har 7 din baad
        completedDates.push({ date: d, done: false });
      }
    } 
    else if (frequency === "Monthly") {
      for (let i = 0; i < target; i++) {
        let d = new Date(today);
        d.setMonth(today.getMonth() + i); // har ek month badhao
        completedDates.push({ date: d, done: false });
      }
    }

    const newHabit = new Habit({
      user: req.user.id,
      name: req.body.name,
      frequency,target,
      startDate: req.body.startDate || Date.now(),
      completedDates,
      streak: 0,
    });

    const saveHabit = await newHabit.save();
    res.status(201).json({ message: "Habit created successfully", saveHabit });
  } catch (err) {
    res.status(500).json({ msg: "Error creating habit", error: err.message });
  }
});

router.delete("/habit/:id", authMiddleware, async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting habit" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const mood = await Mood.find(); //all mood entries
    const habit = await Habit.find(); //all habits
    const moodCounts = {};
    mood.forEach((m) => {
      moodCounts[m.emoji] = (moodCounts[m.emoji] || 0) + 1;
    });

    const journalCount = mood.filter(m => m.note).length;
        const noteCountsByDate={}
    mood.forEach(m=>{
      if(m.note){
        const day=new Date(m.date).toISOString().split("T")[0]
        noteCountsByDate[day]=(noteCountsByDate[day]||0)+1
      }
    })
    const last7days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    });
    const journalTrend=last7days.map(d=>noteCountsByDate[d]||0)
    res.json({
      mood,
      habit,
      moodCounts,
      journalCount,journalTrend
    });

  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving habits", error: err.message });
  }
});
module.exports = router;
