//var registerAndLogin = require('../model/user.js');
var config = require('../config/storage.js').default;
var ObjectID = require('mongodb').ObjectID;
module.exports = {
    insertData  : insertData,
    deleteData  : deleteData,
    updateData  : updateData,
    readData    : readData,
    readDataById: readDataById
};
console.log('coefficient');
/*
 this function is responsible for Insertdata
*/
function insertData(req, res) {
    req.body.user_id= req.userId;
    var p = config.getDB().then(function(db){
        db.collection("chartinsert").insertOne(req.body,function(err,obj){
            console.log(err)
            if(err)  res.status(400).json({success:false, sucerror:err.errors})
            else{
                res.status(200).json({success:true, message: 'inserted successfully.'})
            }
        })
    })
    
}

/*
 this function is responsible for delete data
*/
function deleteData(req, res) {
    var p = config.getDB().then(function(db){
        db.collection("chartinsert").remove({_id:ObjectID(req.params.id)},function(err,data){
            if(err) res.status(500).json({success:false,message:'something went wrong.'})
            else{
                // console.log(data)
                res.status(200).json({success:true, message:'deleted successfully'})
            }
        })
    })
}

/*
this function is for update the data
*/
function updateData(req, res) {
    req.user_id= req.userId
    var p = config.getDB().then(function(db){
        db.collection("chartinsert").update({_id:ObjectID(req.params.id)},req.body,function(err,data){
            console.log(err)
            if(err) res.status(500).json({success:false,message:'something went wrong.'})
            else{
                // console.log(data)
                res.status(200).json({success:true, message:'updated successfully'})
            }
        })
    })
}


/*
this function is for update the data
*/
function readData(req, res) {
    console.log("read data")
    var p = config.getDB().then(function(db){
        db.collection("chartinsert").find({user_id:req.userId}).toArray(function(err,data){
            if(err) res.status(500).json({success:false,message:'something went wrong.'})
            else{
                // console.log(data)
                res.status(200).json({success:true, message:'executed successfully', data:data})
            }
        })
    })
   
}

function readDataById(req,res){
    var p = config.getDB().then(function(db){
        db.collection("chartinsert").findOne({_id:ObjectID(req.params.id)},function(err,data){
            if(err) res.status(500).json({success:false,message:'something went wrong.'})
            else{
                // console.log(data)
                res.status(200).json({success:true, message:'executed successfully', data:data})
            }
        })
    })
}



