let express = require('express');
// create the router object
let router = express.Router();
let $ =require('jquery')
// adding the Body parser
let bodyParser= require('body-parser');
// use path
let path = require('path');
let apiauth = require('./apiauth')
let adminAuth = require('./adminAuth')
let checkAuth=require('./checkAuth')
let mongoose = require('mongoose');
let User = require('../lib/User-model');
let photo = require('../lib/photo-schema')
// export the router
module.exports =router;
router.get('/api',checkAuth,(req,res)=>{
	User.collectedinfo((err,users)=>{
		if(err){
			console.log(err)
		}
        	res.json(users)
	})
	})
	//  THE GET ROUTES FOR AUTH HOME

 router.get('/',(req,res)=>{
   res.redirect('/')
})
router.get('/user',function(req,res){
	 let {username} = res.locals.user




			User.findOne({username:username},function(err,results){
		if(err) {
		let Error = new Error(`Opps, resource can't be found `)
		let state = {
			code: 404,
			Error: error
		}
		res.json(state)


		}
		res.json(results)
	})




})
router.get('/photo',function(req,res){
	let {username} = res.locals.user
	photo.Findphoto(res.locals.user.username,function(err,result){
		if(err){

			let Error = new Error(`Opps, resource can't be found `)
			let state = {
				code: 404,
				Error: error
			}
			res.json(state)
		}
		else{
			res.json(result)
		}
	})
})
router.get('/ext/user/:name',function(req,res){
	let name = req.params.name
	User.findOne({username:name},function(err,user){
		if(err) {
			res.json({code:404,error:'Not Found'})
		}
		else {
			res.json(user)
		}
	})

})
// this fetch the information for react app
router.get('/ext/photo/:name',(req,res)=>{
	let {name} = req.params

	photo.findOne({username:name},function(err,photo){
		if(err||photo==null){
			res.json({code:404, error:'Not Found'})
		}
		else{
			res.json(photo)
		}
	})
})
