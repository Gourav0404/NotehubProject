const asyncHandler = (fn)=>{
    return (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch((err)=>{
            console.log(err);
            res.status(500).json({error: 'Internal Server Error'});
        });
    }
}

export {asyncHandler};