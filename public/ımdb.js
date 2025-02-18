// Sayfa Bazlı Kontrol
const currentpage = document.body.getAttribute("data-page");
if (currentpage === "imdb-movies") {
  // TMDB API Bilgileri
  const API_KEY = "ee0b9d204f137fe0dbc9b0a2aacfdaaf"; // API anahtarınızı buraya yazın
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  // IMDb Puanı En Yüksek 20 Film
  async function fetchTopRatedMovies() {
    try {
      const response = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=10000&with_original_language=en`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const top20Movies = data.results.slice(0, 20); // İlk 20 filmi seç
        displayMovies(top20Movies);
      } else {
        console.error("API'den geçerli bir sonuç alınamadı.");
        displayError("No movies found.");
      }
    } catch (error) {
      console.error("Filmleri çekerken bir hata oluştu:", error);
      displayError("An error occurred while fetching movies.");
    }
  }

  // Filmleri HTML'e Eklemek
  function displayMovies(movies) {
    const container = document.querySelector(".container");
    if (!container) {
      console.error(
        "Container bulunamadı. Lütfen doğru bir 'container' sınıfı ekleyin."
      );
      return;
    }
    container.innerHTML = ""; // Önce mevcut içeriği temizle

    movies.forEach((movie, index) => {
      const shortText = movie.overview
        ? movie.overview.substring(0, 200) + "..."
        : "No description available.";

      const movieHTML = `
        <article class="episode">
          <div class="episode__number">${index + 1}</div>
          <div class="episode__content">
            <div class="movie-poster">
              <img src="${
                movie.poster_path
                  ? IMAGE_BASE_URL + movie.poster_path
                  : "images/no_image_available.png"
              }" alt="${movie.title} Poster" />
            </div>
            <div class="details">
              <div class="title">${movie.title}</div>
              <div class="story">
                <p class="movie-overview" id="overview-${index}">${shortText}</p>
                <button class="toggle-button" onclick="toggleOverview(${index}, '${shortText}', '${movie.overview.replace(
        /'/g,
        "\\'"
      )}')">Read More</button>
              </div>
              <a href="single.html?movieId=${
                movie.id
              }"><button class="detail-button">DETAIL</button></a>
            </div>
          </div>
        </article>
      `;
      container.innerHTML += movieHTML;
    });
  }

  // Açıklamalar Arasında Geçiş
  function toggleOverview(index, shortText, fullText) {
    const overviewElement = document.getElementById(`overview-${index}`);
    const buttonElement = overviewElement
      ? overviewElement.nextElementSibling
      : null;

    if (!overviewElement || !buttonElement) return;

    if (overviewElement.innerHTML === shortText) {
      overviewElement.innerHTML = fullText;
      buttonElement.innerHTML = "Show Less";
    } else {
      overviewElement.innerHTML = shortText;
      buttonElement.innerHTML = "Read More";
    }
  }

  // Hata Mesajı Gösterme
  function displayError(message) {
    const container = document.querySelector(".container");
    if (container) {
      container.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  // Sayfa Yüklenirken API'den Verileri Çek
  document.addEventListener("DOMContentLoaded", fetchTopRatedMovies);
}
