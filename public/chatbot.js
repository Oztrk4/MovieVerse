const API_KEY = "ee0b9d204f137fe0dbc9b0a2aacfdaaf";
const BASE_URL = "https://api.themoviedb.org/3";
let movies = []; // Filmleri tutacağımız dizi

// Filmleri API'den al ve chatbota tanıt
async function fetchMovies() {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&region=TR&page=1`
    );
    const data = await response.json();
    movies = data.results; // API'den gelen filmleri kaydet
  } catch (error) {
    console.error("An error occurred while importing movies:", error);
  }
}

// Kullanıcının mesajına uygun filmi bul ve rezervasyon linki oluştur
function findReservationLink(userMessage) {
  const matchedMovie = movies.find((movie) =>
    userMessage.toLowerCase().includes(movie.title.toLowerCase())
  );

  if (matchedMovie) {
    return `Click here to book tickets: <a href="reservation.html?movieId=${matchedMovie.id}" target="_blank">Reservation Page</a>`;
  } else {
    return "No reservations found for this movie. Try writing about one of the upcoming movies.";
  }
}

// Kullanıcı mesajını analiz ederek yanıt üret
function getBotResponse(userMessage) {
  // Rezervasyon linki kontrolü
  if (userMessage.toLowerCase().includes("ticket")) {
    return findReservationLink(userMessage);
  }

  // Genel yanıt
  return "How can I help you?";
}

// Mesajları ekrana ekleme
function addMessage(content, type) {
  const message = document.createElement("div");
  message.classList.add("message", type);
  message.innerHTML = `<p>${content}</p>`;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Yeni mesaj geldiğinde otomatik aşağı kaydır
}

// Mesaj gönderme işlevi
function sendMessage() {
  const userMessage = chatInputBox.value.trim();
  if (userMessage) {
    addMessage(userMessage, "sent"); // Kullanıcı mesajını göster
    chatInputBox.value = "";

    setTimeout(() => {
      const botResponse = getBotResponse(userMessage); // Bot yanıtını al
      addMessage(botResponse, "received");
    }, 1000);
  }
}

// HTML öğelerini seç
const chatMessages = document.querySelector(".chat-messages");
const chatInputBox = document.getElementById("chat-input-box");
const sendMessageBtn = document.getElementById("send-message");

// Enter tuşuna basıldığında mesaj gönder
chatInputBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

// Gönder butonuna basıldığında mesaj gönder
sendMessageBtn.addEventListener("click", sendMessage);

// Sayfa yüklendiğinde filmleri API'den al
document.addEventListener("DOMContentLoaded", fetchMovies);
