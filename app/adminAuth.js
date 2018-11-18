

let  admin =(req,res,next)=>{
let {log} = console

let {username} =res.locals.user
// enter admin name in includes
const exp = username.includes('')

if(exp!==true){
req.flash('error_msg','not authorized  as admin')
res.redirect('/contact')
}
next()
}
module.exports =admin
