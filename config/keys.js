module.exports ={
    prod: process.env.DBURI|| 'mongodb://merns:mernstack18@ds024748.mlab.com:24748/myusers',
    home:'mongodb://localhost:27017/myusers',
    EA: process.env.EA||'merns20@gmail.com',
    pass: process.env.pass||'mern@2018',
    PORT:process.env.PORT||9000
}