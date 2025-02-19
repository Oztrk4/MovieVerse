// Sayfa Bazlı Kontrol
const currentpage = document.body.getAttribute("data-page");
if (currentpage === "reservation") {
  const API_KEY = "ee0b9d204f137fe0dbc9b0a2aacfdaaf";
  const BASE_URL = "https://api.themoviedb.org/3";
  const BACKEND_URL = "https://movieverse-backend-0vps.onrender.com"; // Backend URL

  // Get the movieId from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("movieId");

  // Fetch and display movie details dynamically
  async function fetchMovieDetails(movieId) {
    try {
      if (!movieId) throw new Error("No movie ID provided.");

      const response = await fetch(
        `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
      );
      if (!response.ok) throw new Error("Movie not found.");

      const movie = await response.json();

      // Populate movie details
      document.getElementById("movie-name").textContent = movie.title;
      document.getElementById("categories").textContent = movie.genres
        .map((genre) => genre.name)
        .join(", ");
      document.getElementById("overview").textContent =
        movie.overview || "No description available.";

      // Set the background image with blur
      if (movie.backdrop_path) {
        document.body.style.setProperty(
          "--background-image",
          `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`
        );
        document.body.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`;
      } else {
        document.body.style.backgroundColor = "#000"; // Default to black if no backdrop
      }
    } catch (error) {
      console.error(error);
      document.getElementById("movie-name").textContent = "Error";
      document.querySelector(".info").innerHTML = `<p>${error.message}</p>`;
    }
  }

  // Fetch and display movie trailer dynamically
  async function fetchMovieTrailer(movieId) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
      );
      if (!response.ok) throw new Error("Trailer not found.");

      const data = await response.json();
      const trailer = data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );

      if (trailer) {
        document.getElementById("trailer").innerHTML = `
          <iframe width="100%" height="300" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1" frameborder="0" allowfullscreen></iframe>
        `;
      } else {
        document.getElementById("trailer").textContent =
          "Trailer not available.";
      }
    } catch (error) {
      console.error(error);
      document.getElementById("trailer").textContent = "Error loading trailer.";
    }
  }

  // Fetch and display director and actors
  async function fetchMovieCredits(movieId) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`
      );
      if (!response.ok) throw new Error("Credits not found.");

      const credits = await response.json();

      // Find director
      const director = credits.crew.find((person) => person.job === "Director");
      document.getElementById("director").textContent = director
        ? director.name
        : "N/A";

      // List actors
      const actors = credits.cast
        .slice(0, 5)
        .map((actor) => actor.name)
        .join(", ");
      document.getElementById("actors").textContent =
        actors || "No actors available.";
    } catch (error) {
      console.error(error);
      document.getElementById("director").textContent =
        "Error loading director.";
      document.getElementById("actors").textContent = "Error loading actors.";
    }
  }

  const avatarUrls = [
    "images/avatar1.png",
    "images/avatar2.png",
    "images/avatar3.png",
    "images/avatar4.png",
    "images/avatar5.png",
    "images/avatar6.png",
    "images/avatar7.png",
    "images/avatar8.png",
    "images/avatar9.png",
    "images/avatar10.png",
    "images/avatar11.png",
    "images/avatar12.png",
    "images/avatar13.png",
  ];

  function getRandomAvatar() {
    const randomIndex = Math.floor(Math.random() * avatarUrls.length);
    return avatarUrls[randomIndex];
  }

  // Fetch and display comments
  async function fetchComments(filmId) {
    try {
      const response = await fetch(`${BACKEND_URL}/comments/${filmId}`);
      if (!response.ok) throw new Error("Failed to fetch comments.");
      const comments = await response.json();

      const commentContainer = document.querySelector(".comment-container");
      commentContainer.innerHTML = ""; // Clear previous comments

      comments.forEach((comment) => {
        const commentBox = document.createElement("div");
        commentBox.classList.add("comment-box");

        const randomAvatar = getRandomAvatar(); // Rastgele avatar seç

        commentBox.innerHTML = `
          <div class="comment-avatar">
            <img src="${randomAvatar}" alt="Avatar" />
            <h2>${comment.userName}</h2>
          </div>
          <div class="comment">
            <p>${comment.comment}</p>
            <p class="comment-date">${new Date(
              comment.createdAt
            ).toLocaleString()}</p>
          </div>
        `;

        commentContainer.appendChild(commentBox);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Add a new comment
  async function addComment(filmId, comment) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add a comment.");
      return;
    }

    // Film adını DOM'dan al
    const filmName = document.getElementById("movie-name").textContent;

    try {
      const response = await fetch(`${BACKEND_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filmId, filmName, comment }), // filmName dahil
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchComments(filmId); // Yorumları yenile
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  }

  // Generate seats
  const seatsContainer = document.getElementById("seats");
  const purchaseBtn = document.getElementById("purchase-btn");
  let selectedSeat = null;

  async function fetchReservedSeats(filmId, date, time) {
    try {
      const response = await fetch(
        `/reserved-seats?filmId=${filmId}&date=${date}&time=${time}`
      );
      if (!response.ok) throw new Error("Failed to fetch reserved seats.");

      const data = await response.json();
      return data.reservedSeats || [];
    } catch (err) {
      console.error("Error fetching reserved seats:", err);
      return [];
    }
  }

  async function generateSeats() {
    if (!seatsContainer) return;

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!date || !time) {
      seatsContainer.innerHTML =
        '<p class="no-date-message">Please select a date and time to see available seats.</p>';
      return;
    }

    const reservedSeats = await fetchReservedSeats(movieId, date, time);

    seatsContainer.innerHTML = ""; // Clear previous seats

    // Add number labels
    const numberRow = document.createElement("div");
    numberRow.classList.add("label");
    seatsContainer.appendChild(document.createElement("div")); // Empty space for the corner
    for (let col = 1; col <= 9; col++) {
      const numberLabel = document.createElement("div");
      numberLabel.textContent = col;
      numberLabel.classList.add("label");
      seatsContainer.appendChild(numberLabel);
    }

    // Add seats with row labels
    for (let row of ["A", "B", "C", "D", "E", "F"]) {
      const rowLabel = document.createElement("div");
      rowLabel.textContent = row;
      rowLabel.classList.add("label");
      seatsContainer.appendChild(rowLabel);

      for (let col = 1; col <= 9; col++) {
        const seatId = `${row}${col}`;
        const seat = document.createElement("div");
        seat.classList.add("seat");
        seat.textContent = seatId; // Seat label

        if (reservedSeats.includes(seatId)) {
          seat.classList.add("reserved");
          seat.style.cursor = "not-allowed"; // JavaScript ile manuel cursor ekleme
        } else {
          // Seçilebilir koltuklar
          seat.addEventListener("click", () => {
            if (selectedSeat) {
              selectedSeat.classList.remove("selected");
            }
            selectedSeat = seat;
            seat.classList.add("selected");
            updatePurchaseButton();
          });
          seat.style.cursor = "pointer"; // Seçilebilir
        }

        seatsContainer.appendChild(seat);
      }
    }
  }

  function updatePurchaseButton() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const ticketType = document.getElementById("ticket-type").value;

    if (date && time && ticketType && selectedSeat) {
      purchaseBtn.classList.add("active");
      purchaseBtn.disabled = false;

      purchaseBtn.onclick = async () => {
        if (!purchaseBtn.disabled) {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("Please log in to purchase a ticket.");
            return;
          }

          // Film adını DOM'dan alıyoruz
          const filmName = document.getElementById("movie-name").textContent;

          if (!filmName || filmName === "Error") {
            alert("Film name is required.");
            return;
          }

          try {
            const response = await fetch(`${BACKEND_URL}/reserve-seat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                filmId: movieId, // Film ID
                filmName, // Film adı
                date, // Seçilen tarih
                time, // Seçilen zaman
                seat: selectedSeat.textContent, // Seçilen koltuk
              }),
            });

            if (response.ok) {
              alert(
                `Ticket purchased!\nFilm: ${filmName}\nDate: ${date}\nTime: ${time}\nSeat: ${selectedSeat.textContent}`
              );
              await generateSeats(); // Koltukları yenile
            } else {
              const data = await response.json();
              alert(data.error || "Failed to reserve seat.");
            }
          } catch (err) {
            console.error("Error reserving seat:", err);
            alert("An error occurred while reserving the seat.");
          }
        }
      };
    } else {
      purchaseBtn.classList.remove("active");
      purchaseBtn.disabled = true;
    }
  }

  document.getElementById("date").addEventListener("change", generateSeats);
  document.getElementById("time").addEventListener("change", generateSeats);

  // Event listeners for comments
  document.getElementById("sub").addEventListener("click", (e) => {
    e.preventDefault();
    const comment = document.getElementById("message").value;
    if (!comment) {
      alert("Please write a comment before submitting.");
      return;
    }

    addComment(movieId, comment);

    document.getElementById("message").value = ""; // Clear textarea
  });

  const textarea = document.getElementById("message");

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to content
  });

  // Fetch movie details, trailer, and credits
  fetchMovieDetails(movieId);
  fetchMovieTrailer(movieId);
  fetchMovieCredits(movieId);
  fetchComments(movieId);
  generateSeats();
}
