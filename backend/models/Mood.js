const mongoose = require("mongoose");
const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  moodScore: {type:Number,required:true,min:1,max:5},
  emoji: String,
  note: String,
  
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Mood", moodSchema);
