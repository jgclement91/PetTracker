/**
 * Created by Julien on 13/09/2015.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('Zone',{
    id: String,
    name: String,
    shape: String,
    allowedUser: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}]
});