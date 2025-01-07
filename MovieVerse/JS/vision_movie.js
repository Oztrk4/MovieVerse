// TMDB API Bilgileri
const API_KEY = 'ee0b9d204f137fe0dbc9b0a2aacfdaaf'; // Buraya API anahtarınızı yazın
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Dil Kodlarını Bayrak Kodlarına Eşleme
const LANGUAGE_TO_COUNTRY = {
  en: 'us', // İngilizce - Amerika
  tr: 'tr', // Türkçe - Türkiye
  fr: 'fr', // Fransızca - Fransa
  es: 'es', // İspanyolca - İspanya
  ja: 'jp', // Japonca - Japonya
  ko: 'kr', // Korece - Güney Kore
  de: 'de', // Almanca - Almanya
  zh: 'cn', // Çince - Çin
  it: 'it', // İtalyanca - İtalya
  ru: 'ru', // Rusça - Rusya
  pt: 'pt', // Portekizce - Portekiz/Brezilya
  hi: 'in', // Hintçe - Hindistan
  ar: 'sa', // Arapça - Suudi Arabistan
};

// Türkiye'deki Vizyondaki Filmleri Çekmek
async function fetchMovies() {
  const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&region=TR&page=1`);
  const data = await response.json();
  displayMovies(data.results);
}

// Filmleri HTML'e Eklemek
function displayMovies(movies) {
  const moviesContainer = document.querySelector('.movies-container');
  moviesContainer.innerHTML = ''; // Önce mevcut içeriği temizle

  movies.forEach((movie) => {
    const language = movie.original_language;
    const country = LANGUAGE_TO_COUNTRY[language] || 'us'; // Dil eşleşmiyorsa varsayılan olarak 'us'

    const movieCard = `
      <div class="card">
        <div class="thumb" style="background-image: url('${IMAGE_BASE_URL + movie.poster_path}')"></div>
        <div class="infos">
          <h2 class="title">${movie.title} 
            <span class="flag" style="background: url('https://flagcdn.com/h20/${country}.png') no-repeat center; background-size: cover;"></span>
          </h2>
          <h3 class="date">Release Date: ${movie.release_date}</h3>
          <h3 class="seats">Rating: ${movie.vote_average}</h3>
          <p class="txt">
            ${movie.overview ? movie.overview.substring(0, 100) + "..." : "No description available."}
          </p>
          <a href="#"><h3 class="movie-details">Buy Tickets</h3></a>
        </div>
      </div>
    `;
    moviesContainer.innerHTML += movieCard;
  });
}

// Sayfa Yüklenirken API'den Verileri Çek
document.addEventListener('DOMContentLoaded', fetchMovies);