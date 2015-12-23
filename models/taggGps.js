/**
 * Created by Julien on 13/09/2015.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('TaggGps',{
    id: String,
    materialId: String,
    name: String,
    allowedUser: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}],
    associatedZone: [{type:mongoose.Schema.Types.ObjectId, ref: 'Zone'}]
});