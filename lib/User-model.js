  const mongoose=require('mongoose');
  var Schema = mongoose.Schema;
  var bcrypt = require('bcryptjs');



//  THIS THE DATA TYPE STORED IN MY DATABASE SCHEMA(MANGOD)
var UserSchema = new Schema({
    name:{type:String, trim:true},
    username:{type:String, index:{unique:true}},

    password:{type:String, required:true},



});
////  THE DATABASE SCHEMA
 var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser =  function (newUser, callback){

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        // Store hash in your password DB.
        newUser.password= hash;
        newUser.save(callback);
    });
});
}
module.exports.getUserByUsername = function(username, callback){
    var query ={username:username};
    User.findOne(query,callback);

};

module.exports.getUserById = function(id, callback){
    // FUNCTION TO FIND THE USER BY ID AND PASSING THE USER TO PASSPORT AND FINALLY FOR USAGE IN AUTHENTICATION AND AUTHORIZATION
    User.findById(id,callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback){
    // FUNCTIONALITY OF HASSING THE PASSWORD BEFORE IT'S STORED INTO THE DATABASE
    bcrypt.compare(candidatePassword, hash,function(err,isMatch) {

         if(err) throw err;
         callback(null,isMatch);
});
}
module.exports.changedinfo = function(username,password,callback){
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password,salt, function(err, hash) {
        // Store hash in your password DB.
        password= hash;
        // FIND THE USER BY USERNAME AND UPDATE OR CHANGE THEIR PASSWORD(THIS CAN BE MODIFIED TO CHANGED ANOTHER CREDENTIAL)
        User.findOneAndUpdate({username:username},{password:password},callback)
    })
    })

}
// FUNCTION THE DELETES THE USER FROM DATABASE
module.exports.deleteUser = function(username,callback){

            User.findOneAndRemove({username:username},callback)




}

module.exports.collectedinfo = (cb)=> {
  User.find(cb)
}
