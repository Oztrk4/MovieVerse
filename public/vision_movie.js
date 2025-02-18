// Sayfa Bazlı Kontrol
const currentpage = document.body.getAttribute("data-page");
if (currentpage === "vision-movies") {
  // TMDB API Bilgileri
  const API_KEY = "ee0b9d204f137fe0dbc9b0a2aacfdaaf";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  // Dil Kodlarını Bayrak Kodlarına Eşleme
  const LANGUAGE_TO_COUNTRY = {
    en: "us",
    tr: "tr",
    fr: "fr",
    es: "es",
    ja: "jp",
    ko: "kr",
    de: "de",
    zh: "cn",
    it: "it",
    ru: "ru",
    pt: "pt",
    hi: "in",
    ar: "sa",
  };

  // Türkiye'deki Vizyondaki Filmleri Çekmek
  async function fetchMovies() {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&region=TR&page=1`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        displayMovies(data.results);
      } else {
        displayError("No movies found.");
      }
    } catch (error) {
      console.error("API çağrısı sırasında bir hata oluştu:", error);
      displayError("An error occurred while fetching movies.");
    }
  }

  // Filmleri HTML'e Eklemek
  function displayMovies(movies) {
    const moviesContainer = document.querySelector(".movies-container");
    if (!moviesContainer) {
      console.error("Movies container bulunamadı. Lütfen doğru bir sınıf ekleyin.");
      return;
    }

    moviesContainer.innerHTML = ""; // Önce mevcut içeriği temizle

    movies.forEach((movie) => {
      const language = movie.original_language;
      const country = LANGUAGE_TO_COUNTRY[language] || "us"; // Dil eşleşmiyorsa varsayılan olarak 'us'

      const movieCard = `
        <div class="card">
          <div class="thumb" style="background-image: url('${
            movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : "images/no_image_available.png"
          }')"></div>
          <div class="infos">
            <h2 class="title">${movie.title}
              <span class="flag" style="background: url('https://flagcdn.com/h20/${country}.png') no-repeat center; background-size: cover;"></span>
            </h2>
            <h3 class="date">Release Date: ${movie.release_date || "N/A"}</h3>
            <h3 class="seats">Rating: ${movie.vote_average || "N/A"}</h3>
            <p class="txt">
              ${movie.overview ? movie.overview.substring(0, 100) + "..." : "No description available."}
            </p>
            <a href="reservation.html?movieId=${movie.id}"><h3 class="movie-details">Buy Tickets</h3></a>
          </div>
        </div>
      `;
      moviesContainer.innerHTML += movieCard;
    });
  }

  // Hata Mesajı Gösterme
  function displayError(message) {
    const moviesContainer = document.querySelector(".movies-container");
    if (moviesContainer) {
      moviesContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  // Sayfa Yüklenirken API'den Verileri Çek
  document.addEventListener("DOMContentLoaded", fetchMovies);
}
