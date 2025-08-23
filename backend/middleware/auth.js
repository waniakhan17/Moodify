const jwt=require('jsonwebtoken');//to verify and decode JWT

//to check if the user is authenticated
module.exports=(req,res,next)=>{
    // Check for token in the Authorization header
//     It looks in the request header called "Authorization".
// The header usually looks like:Authorization: Bearer <token_here>
//.split(' ')[1] means “take the part after the word Bearer” → the actual token
    const token=req.header('Authorization')?.split(' ')[1];
    if(!token){
        res.status(401).json({msg:"No token provided, authorization denied"});
        return;
    }
    //if there is a token then verify using jwt.verify and the secret key
    //jwt.verify with decode the token if the token is valid 
    //return the decoded user info in the token to req.user so other parts of code to know who the user is
    try{
        req.user=jwt.verify(token,process.env.JWT_SECRET);
        next();
    }
    catch{
        res.status(401).json({msg:"Token is not valid, authorization denied"});
    }
 }
