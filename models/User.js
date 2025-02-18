const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
});

// Şifreyi kaydetmeden önce hashleyelim
userSchema.pre('save', async function (next) {
    // Bu kısmı tamamen devre dışı bırakabilirsiniz:
    // if (!this.isModified('password')) return next(); // Şifre değiştirilmediyse işlem yapma

    try {
        // Bu kısmı yoruma alın:
        // this.password = await bcrypt.hash(this.password, 10); // Şifreyi hashle
        next(); // Doğrudan devam et
    } catch (error) {
        next(error); // Hata durumunda işlemi sonlandır
    }
});

// Şifre doğrulama fonksiyonu
userSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
