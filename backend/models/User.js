const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    username:{
        type:String,required:true
    },
    email:{
        type:String,required:true,match:/^\S+@\S+\.\S+$/
    },
    password:{
        type:String,required:true,minlength:6
    },
    gender:{
        type:String,required:true
    },
    dob:{
        type:Date,
        default:Date.now()
    }
});
module.exports=mongoose.model('User',userSchema);