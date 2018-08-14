const mongoose = require('mongoose');

const docSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
  comments: [],
});

module.exports = mongoose.model('Doc', docSchema);