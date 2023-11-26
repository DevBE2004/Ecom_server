const mongoose = require('mongoose')

var brandSchema = new mongoose.Schema({
    brand:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
},{
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Brand', brandSchema);