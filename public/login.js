// Kullanıcı kayıt işlemi
document.getElementById("signup-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  const name = document.getElementById("logname").value;
  const email = document.getElementById("logemail2").value;
  const password = document.getElementById("logpass2").value;

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      // Kayıt başarılı ise input alanlarını temizle
      document.getElementById("logname").value = "";
      document.getElementById("logemail2").value = "";
      document.getElementById("logpass2").value = "";
    } else {
      alert(data.error); // Kullanıcıya geçersiz e-posta hatası göstereceğiz
    }
  } catch (err) {
    console.error("Signup error:", err);
  }
});

// Kullanıcı giriş işlemi
document.getElementById("login-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("logemail").value;
  const password = document.getElementById("logpass").value;

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
      alert("Login successful!");
      updateNavbar(data.name);

      // Kullanıcı giriş yaptıktan sonra profile.html sayfasına yönlendirme
      window.location.href = "profile.html";
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error("Login error:", err);
  }
});

// Navbar güncelleme
function updateNavbar(name) {
  const signInLink = document.getElementById("sign-in");
  signInLink.textContent = name; // Kullanıcı adını göster
  signInLink.href = "/profile.html"; // Profil sayfasına yönlendir
}

// Sayfa yüklenirken kullanıcı giriş yapmışsa Navbar'ı güncelle
document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("name");
  if (name) {
    updateNavbar(name);
  }
});

// Şifre sıfırlama işlemi (Forgot Password)
document
  .querySelector(".link-override")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    const email = prompt("Please enter your email for password reset:");
    if (!email) return;

    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  });
