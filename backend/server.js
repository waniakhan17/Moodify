const express=require("express");
const app=express();
const connectDB=require("./db")
require("dotenv").config()
const cors=require("cors")
const auth=require('./routes/auth')
const authM=require('./middleware/auth');

app.use(cors({
    origin: 'http://localhost:5501' // or wherever your Go Live server is running
,credentials:true}));
app.use(express.json())
connectDB();
app.use('/',auth)
app.use('/',authM)
app.listen(process.env.PORT,()=>
   console.log (`Server is listening on http://localhost:${process.env.PORT}`));