require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require(path.resolve(__dirname, './models/User'));
const Comment = require('./models/Comment'); // Yorum modeli
const Reservation = require('./models/Reservation'); // Rezervasyon modeli
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dns = require('dns');
const { promisify } = require('util');
const resolveMx = promisify(dns.resolveMx);
const cors = require("cors");



const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());

// Middleware
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));







  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Gmail SMTP kullanımı
    auth: {
        user: process.env.EMAIL_USER, // Gönderenin Gmail adresi
        pass: process.env.EMAIL_PASS, // Uygulama şifresi
    },
});


const validateEmail = async (email) => {
    if (!email.includes('@')) return false; // Eğer e-posta formatı yanlışsa direkt false döndür

    const domain = email.split('@')[1]; // E-posta sağlayıcısının alan adını al
    try {
        const mxRecords = await resolveMx(domain);
        return mxRecords && mxRecords.length > 0; // Eğer MX kaydı varsa geçerli e-posta
    } catch (err) {
        return false; // MX kaydı yoksa geçersiz e-posta
    }
};







// Hoş geldiniz e-postası gönder
const sendWelcomeEmail = (email, name) => {
    const mailOptions = {
        from: `MovieVerse <${process.env.EMAIL_USER}>`, // Gönderici adı ve e-posta adresi
        to: email,
        subject: 'Welcome to MovieVerse!',
        text: `Hi ${name},\n\nWelcome to MovieVerse! We are excited to have you on board.\n\nBest regards,\nMovieVerse Team`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending welcome email:', err);
        } else {
            console.log('Welcome email sent:', info.response);
        }
    });
};








const sendResetPasswordEmail = (email, token) => {
    const resetLink = `http://localhost:${PORT}/reset-password/${token}`;

    const mailOptions = {
        from: `MovieVerse <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        text: `Hi,\n\nYou requested to reset your password. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nMovieVerse Team`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending reset password email:', err);
        } else {
            console.log('Reset password email sent:', info.response);
        }
    });
};













// Signup Endpoint
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // **E-posta gerçekten var mı?**
        const isValidEmail = await validateEmail(email);
        if (!isValidEmail) {
            return res.status(400).json({ error: 'Geçersiz e-posta adresi. Lütfen gerçek bir e-posta girin.' });
        }

        // **E-posta zaten kullanılıyor mu?**
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // **Şifreyi hashle ve kullanıcıyı kaydet**
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        sendWelcomeEmail(email, name); // Hoş geldiniz e-postası gönder

        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ error: 'Kayıt işlemi başarısız oldu.' });
    }
});


// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ message: 'Login successful.', token, name: user.name });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Failed to login.' });
    }
});

















app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 saat geçerli
        await user.save();

        sendResetPasswordEmail(email, token); // Şifre sıfırlama e-postası gönder

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
        console.error('Error in forgot-password:', err);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});








app.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});











app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Token geçerlilik süresi
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
});



























// Yorum ekleme (Sadece giriş yapan kullanıcılar)
app.post('/comments', async (req, res) => {
    const { filmId, filmName, comment } = req.body;
  
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. Please login to comment.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      const newComment = new Comment({
        filmId,
        filmName, // filmName ekliyoruz
        userId: user._id,
        userName: user.name,
        comment,
      });
  
      await newComment.save();
      res.status(201).json({ message: 'Comment added successfully.' });
    } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ error: 'Failed to add comment.' });
    }
});

// Belirli bir film için yorumları getir
app.get('/comments/:filmId', async (req, res) => {
    const { filmId } = req.params;

    try {
        const comments = await Comment.find({ filmId }).sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Failed to fetch comments.' });
    }
});

app.post('/reserve-seat', async (req, res) => {
    const { filmId, filmName, date, time, seat } = req.body; // filmName parametresi eklenmiş
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. Please login to reserve a seat.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Koltuk kontrolü
        const existingReservation = await Reservation.findOne({ filmId, date, time, seat });
        if (existingReservation) {
            return res.status(400).json({ error: 'Seat already reserved by another user.' });
        }

        // Film adı kontrolü
        if (!filmName) {
            return res.status(400).json({ error: 'Film name is required.' });
        }

        const newReservation = new Reservation({
            filmId,
            filmName, // Film adı burada kaydediliyor
            date,
            time,
            seat,
            userId: user._id,
            userName: user.name,
        });

        await newReservation.save();
        res.status(201).json({ message: 'Seat reserved successfully.' });
    } catch (err) {
        console.error('Error reserving seat:', err);
        res.status(500).json({ error: 'Failed to reserve seat.' });
    }
});





app.get('/reserved-seats', async (req, res) => {
    const { filmId, date, time } = req.query;
  
    try {
      const reservations = await Reservation.find({ filmId, date, time });
      const reservedSeats = reservations.map((res) => res.seat);
  
      res.status(200).json({ reservedSeats });
    } catch (err) {
      console.error('Error fetching reserved seats:', err);
      res.status(500).json({ error: 'Failed to fetch reserved seats.' });
    }
});

// Şifre testleri için örnek endpointler
app.post('/test-bcrypt-login', async (req, res) => {
    const { plainPassword, storedPassword } = req.body;

    try {
        const isValid = await bcrypt.compare(plainPassword, storedPassword);
        res.status(200).json({ isValid });
    } catch (err) {
        console.error('Bcrypt doğrulama hatası:', err);
        res.status(500).json({ error: 'Bcrypt doğrulama başarısız oldu.' });
    }
});

app.post('/test-password', async (req, res) => {
    const { plainPassword } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);

        res.status(200).json({ hashedPassword, isValid });
    } catch (err) {
        console.error('Şifre testi hatası:', err);
        res.status(500).json({ error: 'Şifre testi başarısız oldu.' });
    }
});

// Authenticated Route (Example)
app.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile data fetched.', user });
    } catch (err) {
        console.error('Error in profile route:', err);
        res.status(401).json({ error: 'Invalid token.' });
    }
});







// Kullanıcı bilgilerini, yorumları ve rezervasyonları dönen endpoint
app.get('/profile-data', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Kullanıcının yorumlarını ve rezervasyonlarını al
        const comments = await Comment.find({ userId: user._id }).sort({ createdAt: -1 });
        const reservations = await Reservation.find({ userId: user._id }).sort({ date: 1 });

        res.status(200).json({
            user: {
                name: user.name,
                avatar: `images/avatar${Math.floor(Math.random() * 13) + 1}.png`, // Rastgele avatar

            },
            comments,
            reservations,
        });
    } catch (err) {
        console.error('Error fetching profile data:', err);
        res.status(500).json({ error: 'Failed to fetch profile data.' });
    }
});










// Logout Endpoint (Optional, Clear Token from Client Side)
app.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully.' });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
