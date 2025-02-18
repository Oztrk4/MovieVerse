const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  filmId: { type: String, required: true }, // Film ID
  filmName: { type: String, required: true }, // Film adı
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kullanıcı ID
  userName: { type: String, required: true }, // Kullanıcı adı
  comment: { type: String, required: true }, // Yorum metni
  createdAt: { type: Date, default: Date.now }, // Oluşturulma zamanı
});

module.exports = mongoose.model('Comment', commentSchema);
