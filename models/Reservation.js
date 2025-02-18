const mongoose = require('mongoose');


const reservationSchema = new mongoose.Schema({
  filmId: { type: String, required: true }, // Film ID
  filmName: { type: String, required: true }, // Film Adı
  date: { type: String, required: true }, // Tarih
  time: { type: String, required: true }, // Saat
  seat: { type: String, required: true }, // Koltuk
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kullanıcı ID
  userName: { type: String, required: true }, // Kullanıcı adı
});

module.exports = mongoose.model('Reservation', reservationSchema);
