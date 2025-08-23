const mongoose = require("mongoose");
const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
    enum: ["Daily", "Weekly", "Monthly"],
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
completedDates: [
  {
    date: Date,
    done: { type: Boolean, default: false }
  }
],
  streak: {
    type: Number
  }, 
  target: Number,
});
module.exports = mongoose.model("Habit", habitSchema);
