// TMDB API Bilgileri
const API_KEY = 'ee0b9d204f137fe0dbc9b0a2aacfdaaf'; // API anahtarınızı buraya yazın
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// IMDb Puanı En Yüksek 20 Film
async function fetchTopRatedMovies() {
  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=10000&with_original_language=en`);
    const data = await response.json();

    if (data.results) {
      // Filmleri IMDb puanına göre sıralayıp ilk 20'yi seç
      const sortedMovies = data.results.sort((a, b) => b.vote_average - a.vote_average);
      const top20Movies = sortedMovies.slice(0, 20);
      displayMovies(top20Movies);
    } else {
      console.error("API'den geçerli bir sonuç alınamadı.");
    }
  } catch (error) {
    console.error("Filmleri çekerken bir hata oluştu:", error);
  }
}


// Filmleri HTML'e Eklemek
function displayMovies(movies) {
  const container = document.querySelector('.container');
  container.innerHTML = ''; // Önce mevcut içeriği temizle

  movies.forEach((movie, index) => {
    const shortText = movie.overview ? movie.overview.substring(0, 200) + '...' : 'No description available.';
    const fullText = movie.overview ? movie.overview : 'No description available.';

    const movieHTML = `
      <article class="episode">
        <div class="episode__number">${index + 1}</div>
        <div class="episode__content">
          <div class="movie-poster">
            <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title} Poster" />
          </div>
          <div class="details">
            <div class="title">${movie.title}</div>
            <div class="story">
              <p class="movie-overview" id="overview-${index}">${shortText}</p>
              <button class="toggle-button" onclick="toggleOverview(${index}, \`${shortText}\`, \`${fullText}\`)">Read More</button>
            </div>
            <a href="single${index + 1}.html"><button class="detail-button">DETAIL</button></a>
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
  const buttonElement = overviewElement.nextElementSibling;

  if (overviewElement.innerHTML === shortText) {
    overviewElement.innerHTML = fullText;
    buttonElement.innerHTML = 'Show Less';
  } else {
    overviewElement.innerHTML = shortText;
    buttonElement.innerHTML = 'Read More';
  }
}

// Sayfa Yüklenirken API'den Verileri Çek
document.addEventListener('DOMContentLoaded', fetchTopRatedMovies);
