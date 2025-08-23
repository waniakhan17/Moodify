require("dotenv").config()
const connectDB=require("./db")
const express=require("express");
const app=express();
const cors=require("cors")
const auth=require('./routes/auth')
const authM=require('./middleware/auth');

app.use(cors({
    origin: '*' // or wherever your Go Live server is running
,credentials:true}));
app.use(express.json())
app.use('/',auth)
app.use('/',authM)
connectDB();
app.listen(process.env.PORT,()=>
   console.log (`Server is listening on http://localhost:${process.env.PORT}`));