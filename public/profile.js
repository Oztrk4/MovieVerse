document.addEventListener("DOMContentLoaded", async () => {
  const commentTab = document.querySelector(".profile-com");
  const reservationTab = document.querySelector(".profile-res");
  const commentContainer = document.querySelector(".profile-comment-container");
  const reservationContainer = document.querySelector(
    ".profile-reservation-container"
  );
  const profileAvatar = document.querySelector(".profile-avatar");
  const profileUsername = document.querySelector(".profile-username h2");

  // İlk yüklemede sadece yorumlar gösterilsin
  commentContainer.style.display = "block";
  reservationContainer.style.display = "none";

  // Kullanıcı verilerini al
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/profile-data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch profile data.");

    const { user, comments, reservations } = await response.json();

    // Avatar ve kullanıcı adını güncelle
    profileAvatar.style.backgroundImage = `url('${user.avatar}')`;
    profileAvatar.style.backgroundSize = "cover";
    profileAvatar.style.backgroundPosition = "center";
    profileAvatar.style.backgroundRepeat = "no-repeat";
    profileUsername.textContent = user.name;

    // Yorumları doldur
    commentContainer.innerHTML = comments
      .map(
        (comment) => `
            <div class="profile-comment-box">
                <div class="profile-comment">
                    <p><strong>Film:</strong> ${comment.filmName}</p>
                    <p>${comment.comment}</p>
                    <p class="comment-date">${new Date(
                      comment.createdAt
                    ).toLocaleString()}</p>
                </div>
            </div>
        `
      )
      .join("");

    // Rezervasyonları doldur
    reservationContainer.innerHTML = reservations
      .map(
        (reservation) => `
            <div class="profile-reservation-box">
                <div class="profile-reservation-moviename">${reservation.filmName}</div>
                <div class="profile-reservation-infos">
                    <div class="infos-movieDate">${reservation.date}</div>
                    <div class="infos-movieTime">${reservation.time}</div>
                    <div class="infos-movieTicket">Seat: ${reservation.seat}</div>
                </div>
            </div>
        `
      )
      .join("");
  } catch (err) {
    console.error("Error loading profile data:", err);
    alert("Failed to load profile data.");
  }

  // MY COMMENT tıklama olayı
  commentTab.addEventListener("click", () => {
    commentContainer.style.display = "block"; // Yorum kutularını göster
    reservationContainer.style.display = "none"; // Rezervasyon kutularını gizle

    // Aktif sekme stili
    commentTab.classList.add("active-tab");
    reservationTab.classList.remove("active-tab");
  });

  // MY RESERVATIONS tıklama olayı
  reservationTab.addEventListener("click", () => {
    commentContainer.style.display = "none"; // Yorum kutularını gizle
    reservationContainer.style.display = "block"; // Rezervasyon kutularını göster

    // Aktif sekme stili
    reservationTab.classList.add("active-tab");
    commentTab.classList.remove("active-tab");
  });
});
