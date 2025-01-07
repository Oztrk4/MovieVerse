let lastScrollY = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > lastScrollY) {
    // Aşağı kaydırma
    navbar.style.transform = "translateY(-100%)";
  } else {
    // Yukarı kaydırma
    navbar.style.transform = "translateY(0)";
  }

  if (window.scrollY === 0) {
    navbar.classList.add("top");
    navbar.classList.remove("scrolled");
  } else {
    navbar.classList.add("scrolled");
    navbar.classList.remove("top");
  }

  lastScrollY = window.scrollY;
});

// Arama kutusu
const searchButton = document.getElementById("search-button");
const searchBox = document.getElementById("search-box");
const searchInput = document.getElementById("search-input");
const performSearch = document.getElementById("perform-search");

searchButton.addEventListener("click", () => {
  searchBox.classList.toggle("hidden");
  if (!searchBox.classList.contains("hidden")) {
    searchInput.focus();
  }
});

performSearch.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    alert(`"${query}" için arama yapılıyor!`);
  }
});


const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

// Responsive Menu Toggle
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});








const carousel = document.querySelector('.carousel');
const items = document.querySelectorAll('.carousel-item');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

const cards = document.querySelectorAll('.card');
let currentActiveIndex = 0; // Başlangıçta aktif olan kartın indeksi

function updateActiveCard() {
  cards.forEach((card, index) => {
    card.classList.remove('active'); // Tüm kartlardan active sınıfını kaldır
    if (index === currentActiveIndex) {
      card.classList.add('active'); // Sadece aktif karta active sınıfını ekle
    }
  });
}

// Sağ oka tıklama
document.querySelector('.next-btn').addEventListener('click', () => {
  currentActiveIndex = (currentActiveIndex + 1) % cards.length; // Bir sonraki karta geç
  updateActiveCard();
});

// Sol oka tıklama
document.querySelector('.prev-btn').addEventListener('click', () => {
  currentActiveIndex = (currentActiveIndex - 1 + cards.length) % cards.length; // Bir önceki karta geç
  updateActiveCard();
});

// İlk durumu güncelle
updateActiveCard();


