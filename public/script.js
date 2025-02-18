// Sayfa bazlı kontrol
const page = document.body.getAttribute("data-page");

// Navbar İşlevleri (her sayfa için geçerli)
let lastScrollY = 0;
const navbar = document.querySelector(".navbar");

if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > lastScrollY) {
      navbar.style.transform = "translateY(-100%)"; // Aşağı kaydırma
    } else {
      navbar.style.transform = "translateY(0)"; // Yukarı kaydırma
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
}

// Vizyondaki ve IMDb ilk 20 filmleri tutmak için birleşik liste
let combinedMovies = [];

// TMDB API Bilgileri
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = "ee0b9d204f137fe0dbc9b0a2aacfdaaf";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Vizyondaki filmleri yükleme
async function fetchNowPlayingMovies() {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&region=TR&page=1`
  );
  const data = await response.json();
  return (data.results || []).map((movie) => ({
    ...movie,
    source: "now_playing",
  })); // Kaynağı belirt
}

// IMDb ilk 20 filmi yükleme
async function fetchTopRatedMovies() {
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=10000&with_original_language=en`
  );
  const data = await response.json();
  return (data.results || [])
    .slice(0, 20)
    .map((movie) => ({ ...movie, source: "imdb" })); // Kaynağı belirt
}

// Tüm filmleri yükleyip birleştirme
async function loadCombinedMovies() {
  try {
    const nowPlayingMovies = await fetchNowPlayingMovies();
    const topRatedMovies = await fetchTopRatedMovies();
    combinedMovies = [...nowPlayingMovies, ...topRatedMovies]; // İki listeyi birleştir
    console.log("Yüklenen Filmler:", combinedMovies);
  } catch (error) {
    console.error("Filmleri yüklerken bir hata oluştu:", error);
  }
}

// Fullscreen Arama Kutusu (Navbar)
const searchButton = document.getElementById("search-button");
const fullscreenSearch = document.getElementById("fullscreen-search");
const searchInput = document.getElementById("fullscreen-search-input");
const closeSearch = document.getElementById("close-search");
const fullscreenSearchResults = document.getElementById(
  "fullscreen-search-results"
);

if (searchButton && fullscreenSearch && searchInput && closeSearch) {
  // Filmleri yükle
  loadCombinedMovies();

  searchButton.addEventListener("click", () => {
    fullscreenSearch.classList.add("active");
    searchInput.focus();
  });

  closeSearch.addEventListener("click", () => {
    fullscreenSearch.classList.remove("active");
    fullscreenSearchResults.innerHTML = ""; // Sonuçları temizle
    fullscreenSearchResults.style.display = "none"; // Sonuçları gizle
  });

  searchInput.addEventListener("keyup", (event) => {
    const query = searchInput.value.trim().toLowerCase();
    if (event.key === "Enter" && query) {
      searchMovies(query);
    }
  });

  function searchMovies(query) {
    // Birleşik listede arama yap
    const filteredMovies = combinedMovies.filter((movie) =>
      movie.title.toLowerCase().includes(query)
    );
    displaySearchResults(filteredMovies);
  }

  function displaySearchResults(movies) {
    fullscreenSearchResults.innerHTML = ""; // Önceki sonuçları temizle
    fullscreenSearchResults.style.display = "none"; // Başlangıçta gizle

    if (movies.length === 0) {
      fullscreenSearchResults.innerHTML = "<p>No results found.</p>";
      fullscreenSearchResults.style.display = "block"; // Boş sonuçlar mesajını göster
      return;
    }

    movies.forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.classList.add("search-result-item");
      movieElement.innerHTML = `
        <img src="${
          movie.poster_path
            ? IMAGE_BASE_URL + movie.poster_path
            : "images/no_image_available.png"
        }" alt="${movie.title}" />
        <div>
          <h3>${movie.title}</h3>
          <p>${movie.release_date || "No release date available"}</p>
        </div>
      `;

      // Filme tıklama ile doğru sayfaya yönlendirme
      movieElement.addEventListener("click", () => {
        if (movie.source === "now_playing") {
          // Vizyondaki filmse reservation.html
          window.location.href = `reservation.html?movieId=${movie.id}`;
        } else if (movie.source === "imdb") {
          // IMDb'den geldiyse single.html
          window.location.href = `single.html?movieId=${movie.id}`;
        }
      });

      fullscreenSearchResults.appendChild(movieElement);
    });

    fullscreenSearchResults.style.display = "block"; // Sonuçlar varsa görünür yap
  }
}

// Responsive Menü
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Carousel (Sadece Home Sayfasında)
if (page === "home") {
  const carousel = document.querySelector(".carousel");
  const items = document.querySelectorAll(".carousel-item");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const cards = document.querySelectorAll(".card");
  let currentActiveIndex = 0; // Başlangıçta aktif olan kartın indeksi

  function updateActiveCard() {
    cards.forEach((card, index) => {
      card.classList.remove("active"); // Tüm kartlardan active sınıfını kaldır
      if (index === currentActiveIndex) {
        card.classList.add("active"); // Sadece aktif karta active sınıfını ekle
      }
    });
  }

  if (carousel && items.length && prevBtn && nextBtn) {
    // Sağ oka tıklama
    nextBtn.addEventListener("click", () => {
      currentActiveIndex = (currentActiveIndex + 1) % cards.length; // Bir sonraki karta geç
      updateActiveCard();
    });

    // Sol oka tıklama
    prevBtn.addEventListener("click", () => {
      currentActiveIndex =
        (currentActiveIndex - 1 + cards.length) % cards.length; // Bir önceki karta geç
      updateActiveCard();
    });

    // İlk durumu güncelle
    updateActiveCard();
  }
}

// Chatbot (Her Sayfa için)
const chatbotButton = document.getElementById("chatbot-button");
const chatbox = document.getElementById("chatbox");

if (chatbotButton && chatbox) {
  chatbotButton.addEventListener("click", () => {
    chatbox.style.display = chatbox.style.display === "none" ? "block" : "none";
  });

  // Sayfada başka bir yere tıklanırsa chatbox kapansın
  document.addEventListener("click", (event) => {
    if (
      !event.target.closest("#chatbot-container") &&
      chatbox.style.display === "block"
    ) {
      chatbox.style.display = "none";
    }
  });
}

// Kullanıcı adı göstermek ve logout işlemi
document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("name");
  const signInLink = document.getElementById("sign-in");
  const logoutButton = document.getElementById("logout");
  const loginPreview = document.querySelector(".login-preview");
  const filmCarousel = document.querySelector(".film-carousel");

  if (name && signInLink) {
    signInLink.textContent = name;
    signInLink.href = "/profile.html";

    // Kullanıcı giriş yaptıysa sol tarafı gizle, carousel tüm alanı kaplasın
    if (loginPreview && filmCarousel) {
      loginPreview.style.display = "none"; // Giriş yapma alanını gizle
      filmCarousel.style.width = "100%"; // Carousel'in tüm genişliği kaplamasını sağla
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        alert("You have successfully logged out!");
        signInLink.textContent = "Sign In";
        signInLink.href = "/login.html";

        // Çıkış yapıldığında giriş ekranını geri getir
        if (loginPreview && filmCarousel) {
          loginPreview.style.display = "flex"; // Giriş yapma alanını geri getir
          filmCarousel.style.width = "70%"; // Carousel'in genişliğini eski haline getir
        }

        window.location.href = "login.html";
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const indexLoginForm = document.getElementById("index-login-form");

  if (indexLoginForm) {
    indexLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("index-email").value;
      const password = document.getElementById("index-password").value;

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("name", data.name);

          // Navbar'daki "Sign In" yazısını güncelle
          updateNavbar(data.name);

          // Başarılı giriş mesajı göster
          alert("Login successful!");

          // Sayfayı 1 saniye sonra yenile (daha iyi kullanıcı deneyimi için)
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          alert(data.error); // Hata mesajını göster
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("An unexpected error occurred. Please try again.");
      }
    });
  }

  // Navbar güncelleme fonksiyonu
  function updateNavbar(name) {
    const signInLink = document.getElementById("sign-in");
    if (signInLink) {
      signInLink.textContent = name; // Kullanıcı adını göster
      signInLink.href = "/profile.html"; // Profil sayfasına yönlendir
    }
  }

  // Eğer kullanıcı giriş yaptıysa Navbar'ı güncelle
  const storedName = localStorage.getItem("name");
  if (storedName) {
    updateNavbar(storedName);
  }
});
