

let  admin =(req,res,next)=>{
let {log} = console

let {username} =res.locals.user

const exp = username.includes('najib2')

if(exp!==true){
req.flash('error_msg','not authorized  as admin')
res.redirect('/contact')
}
next()
}
module.exports =admin
