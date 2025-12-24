const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    payload: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
