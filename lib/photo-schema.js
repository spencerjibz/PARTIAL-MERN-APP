let mongoose = require('mongoose')
let { Schema } = mongoose
let os = require('os')//  this module provide information about the operating system
let path = require('path')
let fs = require('fs') // this nodejs module is intended to managed my uplaad folder and its contents
const { platform } = os
// test for  the os
let IsWins = /win/.test(platform())
let IsLinux = /linux/.test(platform())

let photo = new Schema({
    username: { type: String, required: true, index: { unique: true } },

    photoPath: { type: String, trim: true, required: true },


})

const { log } = console
let photoapi = module.exports = mongoose.model('photo', photo)
// FUNCTION THAT SAVES A USER'S PHOTO INFORMATION
module.exports.Savephoto = function (username, path, cb) {
    query = new photoapi({ username: username, photoPath: path })
    query.save(cb)
}
// FUNCTION THAT  RETRIEVE THE USER'S PHOTO INFORMATION

module.exports.Findphoto = function (username, cb) {
    photoapi.findOne({ username: username }, cb)

}
// FUNCTION THAT CHANGES THE USER'S PHOTO
module.exports.Updatephoto = function (username, path, cb) {
    photoapi.findOne({ username: username }, function (err, ismatch) {
        if (err || ismatch == null) {
            cb(new Error('match not found'))
        }
        else {
            let mypath = ismatch.photoPath


            IsLinux === true ?
                mypath = `\public${ismatch.photoPath}` : mypath = `public/${ismatch.photoPath}`
            fs.unlink(mypath, function (err) {
                if (err) {
                    cb(err)

                }
                else {
                    photoapi.findOneAndUpdate({ username: username }, { photoPath: path }, cb)
                }
            })
        }
    })
}
// FUNCTION THE DELETES THE USER'S PHOTO
module.exports.Deletephoto = function (username, cb) {
    // fetch to filepath from the database  for usage in the next stage
    photoapi.Findphoto(username, function (err, photo) {
        if (photo !== null) {
            let imagepath = photo.photoPath
            IsLinux === true ? image = `\public${photo.photoPath}` :
                imagepath = `public${photo.photoPath}`
            //  find out if the file exists in the file system before deleting it.  function above checks for the desired file
            fs.access(imagepath, function (err) {
                if (err) {
                    log(err)
                    // delete the photoinformation from the database even if the 
                    photoapi.findOneAndDelete({
                        username: username
                    })
                    
                }
                else {
                    //  if file exist, this function then deletes the file and finally the last function delete the photo's info from the database
                    fs.unlink(imagepath, function (err, done) {
                        if (err) {
                            log(err)
                        }
                        else {
                            photoapi.findOneAndDelete({ username: username }, cb)
                        }
                    })
                }
            })
        }
        cb(null, false)

    })
}
