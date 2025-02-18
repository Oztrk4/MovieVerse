// API Bilgileri
const SINGLE_API_KEY = "ee0b9d204f137fe0dbc9b0a2aacfdaaf";
const SINGLE_BASE_URL = "https://api.themoviedb.org/3";
const SINGLE_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

// URL'den movieId parametresini al
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("movieId");

// Film detaylarını yükleme
async function fetchMovieDetails() {
  try {
    if (!movieId) throw new Error("Film ID'si bulunamadı!");

    // Film detaylarını ve kredilerini API'den al
    const [movieResponse, creditsResponse] = await Promise.all([
      fetch(
        `${SINGLE_BASE_URL}/movie/${movieId}?api_key=${SINGLE_API_KEY}&language=en-US`
      ),
      fetch(
        `${SINGLE_BASE_URL}/movie/${movieId}/credits?api_key=${SINGLE_API_KEY}&language=en-US`
      ),
    ]);

    const movie = await movieResponse.json();
    const credits = await creditsResponse.json();

    // Yönetmeni bul
    const director =
      credits.crew.find((person) => person.job === "Director")?.name ||
      "No Director Available";

    // Aktörleri listele (sadece 3 aktör)
    const actors =
      credits.cast
        .slice(0, 3)
        .map((actor) => actor.name)
        .join(", ") || "No Actors Available";

    // Sayfa başlığı ve film detaylarını doldur
    document.querySelector(".title-svg textPath").textContent =
      movie.title || "No Title Available";
    document.querySelector(".imdb-category-director ul").innerHTML = `
      <li>${
        movie.genres.map((genre) => genre.name).join(" / ") ||
        "No Category Available"
      }</li>
      <li>${director}</li>
    `;
    document.querySelector(".imdb-actors ul").innerHTML = actors
      .split(", ")
      .map((actor) => `<li>${actor}</li>`)
      .join("");
    document.querySelector(".imdb-summary p").textContent =
      movie.overview || "No Overview Available";

    // Arkaplanı body'ye ayarla
    const backdropUrl = movie.backdrop_path
      ? `${SINGLE_BACKDROP_BASE_URL}${movie.backdrop_path}`
      : "images/default_background.jpg";
    document.body.style.backgroundImage = `url(${backdropUrl})`;

    // Fragman bilgilerini yükle
    fetchMovieTrailer(movieId);
  } catch (error) {
    console.error("Film detaylarını yüklerken bir hata oluştu:", error);
    document.querySelector(
      ".single-imdb-container"
    ).innerHTML = `<p>Film detayları yüklenemedi.</p>`;
  }
}

// Film fragmanını yükleme
async function fetchMovieTrailer(movieId) {
  try {
    const response = await fetch(
      `${SINGLE_BASE_URL}/movie/${movieId}/videos?api_key=${SINGLE_API_KEY}&language=en-US`
    );
    const data = await response.json();

    const trailer = data.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );
    if (trailer) {
      document.querySelector(
        ".imdb-trailer iframe"
      ).src = `https://www.youtube.com/embed/${trailer.key}`;
    } else {
      document.querySelector(".imdb-trailer").innerHTML =
        "<p>Fragman bulunamadı.</p>";
    }
  } catch (error) {
    console.error("Fragman yüklenirken bir hata oluştu:", error);
    document.querySelector(".imdb-trailer").innerHTML =
      "<p>Fragman yüklenemedi.</p>";
  }
}

// Sayfa yüklendiğinde film detaylarını getir
document.addEventListener("DOMContentLoaded", fetchMovieDetails);
