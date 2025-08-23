const mongoose=require("mongoose")
const journalSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now
    },
    mood:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Mood'
    }
})
module.exports=mongoose.model('Journal',journalSchema);