let linkModal = new bootstrap.Modal(document.getElementById("linkModal"));
let links = [];

// Show/Hide pages
function showBuildPage() {
  document.getElementById("buildPage").style.display = "block";
  document.getElementById("designPage").style.display = "none";
  document
    .querySelector('a[onclick="showBuildPage()"]')
    .classList.add("active");
  document
    .querySelector('a[onclick="showDesignPage()"]')
    .classList.remove("active");
}

function showDesignPage() {
  document.getElementById("buildPage").style.display = "none";
  document.getElementById("designPage").style.display = "block";
  document
    .querySelector('a[onclick="showBuildPage()"]')
    .classList.remove("active");
  document
    .querySelector('a[onclick="showDesignPage()"]')
    .classList.add("active");
}

// Add Link Modal
function showAddLinkModal() {
  document.getElementById("modalTitle").textContent = "Add New Link";
  document.getElementById("linkForm").reset();
  document.getElementById("linkIndex").value = "";
  linkModal.show();
}

function saveLink() {
  const form = document.getElementById("linkForm");
  if (form.checkValidity()) {
    const newLinkUrl = document.getElementById("linkUrl").value;

    // Cek apakah URL sudah ada di daftar links
    const isDuplicateLink = links.some((link) => link.url === newLinkUrl);

    if (isDuplicateLink) {
      alert("Another button is using this link. Please enter a different one.");
      return;
    }

    const linkData = {
      title: document.getElementById("linkTitle").value,
      description: document.getElementById("linkDescription").value,
      url: newLinkUrl,
      short: document.getElementById("linkShort").value,
    };

    const index = document.getElementById("linkIndex").value;
    if (index === "") {
      // Tambah link baru
      links.push(linkData);
    } else {
      // Update link yang sudah ada
      links[index] = linkData;
    }

    renderLinks();
    linkModal.hide();
    form.reset();
    console.log("Links:", links);
  } else {
    alert("Please fill in all required fields.");
  }
}

// Tambahkan fungsi untuk memuat ulang data dari database saat halaman dimuat
function loadLinktreeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  fetch(`/linktree/get/${id}`)
    .then((response) => response.json())
    .then((data) => {
      // Set links dari data database
      links = data.buttonData || [];
      renderLinks();
    })
    .catch((error) => {
      console.error("Error loading linktree data:", error);
    });
}

// Panggil fungsi ini saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", loadLinktreeData);

function renderLinks() {
  const linksList = document.getElementById("linksList");
  const previewLinks = document.getElementById("previewLinks");

  // Kosongkan konten sebelumnya
  linksList.innerHTML = "";
  previewLinks.innerHTML = "";

  links.forEach(({ title, short, url }, index) => {
    // Buat elemen kartu link
    const linkItem = document.createElement("div");
    linkItem.className = "card mb-3";
    linkItem.innerHTML = `
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0">${title}</h6>
          <small class="text-muted">plb.sh/${short}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2" 
                  onclick="showEditLinkModal(${index})" aria-label="Edit link ${title}">
            Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="deleteLink(${index})" aria-label="Delete link ${title}">
            Delete
          </button>
        </div>
      </div>
    `;

    // Tambahkan elemen kartu ke dalam daftar links
    linksList.appendChild(linkItem);

    // Buat elemen pratinjau link
    const previewLink = document.createElement("a");
    previewLink.href = url;
    previewLink.className = "preview-link";
    previewLink.innerText = title;
    previewLinks.appendChild(previewLink);
  });
}

// Edit Link Modal
function showEditLinkModal(index) {
  const link = links[index];
  document.getElementById("modalTitle").textContent = "Edit Link";
  document.getElementById("linkIndex").value = index;
  document.getElementById("linkTitle").value = link.title;
  document.getElementById("linkDescription").value = link.description || "";
  document.getElementById("linkUrl").value = link.url;
  document.getElementById("linkShort").value = link.short;
  linkModal.show();
}

// Delete Link
function deleteLink(index) {
  if (confirm("Are you sure you want to delete this link?")) {
    links.splice(index, 1);
    renderLinks();
  }
}

// Get DOM elements
const titleInput = document.getElementById("titleInput");
const bioInput = document.getElementById("bioInput");
const previewUsername = document.getElementById("previewUsername");

// Update display name in preview
titleInput.addEventListener("input", function () {
  previewUsername.textContent = this.value || "@username";
});

// Update bio in preview
bioInput.addEventListener("input", function () {
  let previewBio = document.getElementById("previewBio");
  if (!previewBio) {
    previewBio = document.createElement("p");
    previewBio.id = "previewBio";
    previewBio.className = "text-white mb-4";
    previewUsername.parentNode.insertBefore(
      previewBio,
      previewUsername.nextSibling
    );
  }
  previewBio.textContent = this.value;
});

// Optional: Ensure color persists when dynamically adding content
function ensurePreviewColorConsistency(color) {
  // This function can be called after any dynamic content changes
  const previewUsername = document.getElementById("previewUsername");
  const previewBio = document.getElementById("previewBio");

  if (previewUsername) {
    previewUsername.style.color = color;
  }

  if (previewBio) {
    previewBio.style.color = color;
  }
}

// Image handling
function showImageOptions() {
  const modal = new bootstrap.Modal(
    document.getElementById("imageOptionsModal")
  );
  modal.show();
}

function uploadImage() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = handleImageUpload;
  input.click();
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      updateProfileImage(event.target.result);
      bootstrap.Modal.getInstance(
        document.getElementById("imageOptionsModal")
      ).hide();
    };
    reader.readAsDataURL(file);
  }
}

function updateProfileImage(imageUrl) {
  const profileImage = document.getElementById("profileImage");
  const previewProfileImage = document.getElementById("previewProfileImage");

  if (profileImage) profileImage.src = imageUrl;
  if (previewProfileImage) previewProfileImage.src = imageUrl;
}

// Font management
const fonts = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Oswald",
];

// Initialize font options
function initializeFonts() {
  const fontContainer = document.querySelector(".font-options");
  fontContainer.innerHTML = "";

  fonts.forEach((font) => {
    const fontOption = document.createElement("div");
    fontOption.className = "font-option";
    fontOption.textContent = font;
    fontOption.style.fontFamily = font;
    fontOption.onclick = () => changeFont(font);
    fontContainer.appendChild(fontOption);
  });
}

// Change font for preview content
function changeFont(fontFamily) {
  // Remove active class from all font options
  document.querySelectorAll(".font-option").forEach((option) => {
    option.classList.remove("active");
    if (option.textContent === fontFamily) {
      option.classList.add("active");
    }
  });

  // Apply font to preview content
  const previewContent = document.getElementById("previewContent");
  if (previewContent) {
    previewContent.style.fontFamily = fontFamily;
  }
}

// Change font color
function changeFontColor(color) {
  const previewContent = document.getElementById("previewContent");
  if (previewContent) {
    // Terapkan warna ke seluruh elemen dalam preview
    previewContent.style.color = color;

    // Query semua elemen teks dalam preview
    const textElements = previewContent.querySelectorAll(
      "#previewUsername, #previewBio, .text-white"
    );

    textElements.forEach((element) => {
      // Secara eksplisit set warna untuk setiap elemen
      element.style.color = color;

      // Tambahkan !important untuk memastikan warna diterapkan
      element.style.setProperty("color", color, "important");
    });
  }
}

// Button style management
function changeButtonStyle(style) {
  const previewLinks = document.querySelectorAll(".preview-link");
  const buttons = document.querySelectorAll(".block-shape");

  // Remove active class from all button style options
  buttons.forEach((btn) => btn.classList.remove("active"));

  // Add active class to selected style
  const selectedButton = document.querySelector(
    `.block-shape[onclick="changeButtonStyle('${style}')"]`
  );
  if (selectedButton) {
    selectedButton.classList.add("active");
  }

  // Apply button style to preview links
  previewLinks.forEach((link) => applyButtonStyle(link, style));
}

// Apply specific button style
function applyButtonStyle(element, style) {
  switch (style) {
    case "rounded":
      element.style.borderRadius = "25px";
      break;
    case "sharp":
      element.style.borderRadius = "0";
      break;
    case "standard":
    default:
      element.style.borderRadius = "8px";
      break;
  }
}

// Change button color
function changeButtonColor(color) {
  const previewLinks = document.querySelectorAll(".preview-link");
  previewLinks.forEach((link) => {
    link.style.backgroundColor = color;
  });
}

// Theme management
// Function to apply custom gradient
function applyCustomGradient() {
  const color1 = document.getElementById("gradientColor1").value;
  const color2 = document.getElementById("gradientColor2").value;
  changeTheme(color1, color2);
}

// Function to apply solid color
function applySolidColor() {
  const color = document.getElementById("solidColor").value;
  changeTheme(color, color);
}

// Enhanced theme change function
function changeTheme(color1, color2) {
  const previewContent = document.getElementById("previewContent");
  if (previewContent) {
    previewContent.style.background =
      color1 === color2
        ? color1
        : `linear-gradient(to bottom, ${color1}, ${color2})`;

    // Update active states
    document.querySelectorAll(".theme-option").forEach((option) => {
      const background = option.style.background;
      const isActive =
        background.includes(color1) && background.includes(color2);
      option.classList.toggle("active", isActive);
    });
  }
}

//background image
const backgroundImages = [
  "/assets/img/Gedung-H2.jpg",
  "/assets/img/gedung-h3.jpg",
  "/assets/img/masjid-lh.jpg",
  "/assets/img/sc2.jpg",
  "/assets/img/sc.jpg",
];

// Fungsi untuk menginisialisasi pilihan background image
function initializeBackgroundImages() {
  console.log("Fungsi initializeBackgroundImages dipanggil");

  const themeSection = document.getElementById("theme");
  console.log("Elemen theme section:", themeSection);

  const backgroundContainer = document.createElement("div");
  backgroundContainer.id = "background-image-options";
  backgroundContainer.className =
    "d-flex flex-wrap justify-content-center mb-3";

  backgroundImages.forEach((imageUrl, index) => {
    console.log(`Memproses gambar: ${imageUrl}`);

    const imageOption = document.createElement("div");
    imageOption.className = "background-image-option m-2 position-relative";
    imageOption.style.width = "80px";
    imageOption.style.height = "60px";
    imageOption.style.overflow = "hidden";
    imageOption.style.cursor = "pointer";
    imageOption.style.border = "2px solid transparent";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    imageOption.appendChild(img);
    imageOption.onclick = () => changeBackgroundImage(imageUrl);
    backgroundContainer.appendChild(imageOption);
  });

  // Periksa apakah tema section ada
  if (themeSection) {
    const backgroundSection = document.createElement("div");
    backgroundSection.innerHTML = `<h6 class="mb-2">Background Image</h6>`;
    backgroundSection.appendChild(backgroundContainer);

    console.log("Mencoba menambahkan background section");
    themeSection.appendChild(backgroundSection);
    console.log("Background section ditambahkan");
  } else {
    console.error("Elemen theme section tidak ditemukan!");
  }
}

// Fungsi untuk mengubah background image
function changeBackgroundImage(imageUrl) {
  const previewContent = document.getElementById("previewContent");
  if (previewContent) {
    // Set background image dengan cover dan center
    previewContent.style.backgroundImage = `url('${imageUrl}')`;
    previewContent.style.backgroundSize = "cover";
    previewContent.style.backgroundPosition = "center";

    // Tambahkan properti untuk responsivitas
    previewContent.style.backgroundRepeat = "no-repeat";
    previewContent.style.width = "100%";
    previewContent.style.height = "100%";
    previewContent.style.minHeight = "500px"; // Minimal tinggi untuk berbagai layar
  }

  // Update status aktif untuk pilihan background image
  document.querySelectorAll(".background-image-option").forEach((option) => {
    const img = option.querySelector("img");
    const isActive = img && img.src.includes(imageUrl);

    // Tambahkan efek visual untuk gambar yang dipilih
    option.style.border = isActive
      ? "2px solid #007bff"
      : "2px solid transparent";
  });
}

// Tambahkan event listener pada setiap gambar
document.addEventListener("DOMContentLoaded", () => {
  const backgroundImageOptions = document.querySelectorAll(
    ".background-image-option"
  );

  backgroundImageOptions.forEach((option) => {
    const img = option.querySelector("img");

    option.addEventListener("click", () => {
      if (img) {
        changeBackgroundImage(img.src);
      }
    });
  });
});

// Initialize everything when the document is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeFonts();

  // Panggil fungsi untuk menginisialisasi background image
  initializeBackgroundImages();

  // Jika ingin set default background
  if (backgroundImages.length > 0) {
    changeBackgroundImage(backgroundImages[0]);
  }

  // Set default font
  changeFont("Inter");

  // Set default button style
  changeButtonStyle("standard");

  // Set default theme
  changeTheme("#4158d0", "#c850c0");

  // Initialize color pickers with default values
  document.getElementById("gradientColor1").value = "#4158d0";
  document.getElementById("gradientColor2").value = "#c850c0";
  document.getElementById("solidColor").value = "#3498db";
});

// Fungsi untuk menyimpan perubahan
async function saveChanges() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id"); // Ambil ID dari URL
  if (!idLinktree) {
    alert("ID Linktree tidak ditemukan di URL!");
    return;
  }

  // Data yang akan dikirim, bisa disesuaikan
  const title = "title shortlink apa"; // Contoh judul
  const bio = "bio bio bio"; // Contoh bio

  // Data gaya yang akan dikirim, bisa disesuaikan
  const style = {
    font: "consolas",
    "bg-color": "red",
  };

  // Membuat objek data yang akan dikirim
  const data = {
    title: title,
    bio: bio,
    style: style,
    btnArray: links,
  };

  // Mengirim data dengan metode PATCH
  try {
    const response = await fetch(
      `http://localhost:8000/linktree/save?id=${idLinktree}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      alert("Perubahan berhasil disimpan!");
    } else {
      alert("Gagal menyimpan perubahan.");
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    alert("Terjadi kesalahan saat menyimpan perubahan.");
  }
}

// Fungsi untuk mengambil data dari API
async function fetchLinktreeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id"); // Ambil ID dari URL
  if (!id) {
    alert("ID tidak ditemukan di URL!");
    return;
  }

  try {
    const response = await fetch(`/linktree/get/${id}`);
    if (!response.ok) {
      throw new Error("Gagal memuat data Linktree");
    }

    const data = await response.json();
    console.log("Button Data:", data.btnArray); // Debugging

    // Render tombol berdasarkan data buttonData
    renderButtons(data.btnArray);
  } catch (error) {
    console.error("Error loading buttons:", error);
  }
}

// Fungsi untuk merender tombol dari data
function renderButtons(buttonData) {
  const buttonContainer = document.getElementById("buttonContainer");
  buttonContainer.innerHTML = ""; // Bersihkan kontainer

  buttonData.forEach((button) => {
    const btn = document.createElement("button");
    btn.textContent = button.button_name; // Sesuaikan dengan kolom database
    btn.onclick = () => window.open(button.url, "_blank");
    buttonContainer.appendChild(btn);
  });
}

// Panggil fetchLinktreeData saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchLinktreeData);

// const urlParams = new URLSearchParams(window.location.search);
// const id = urlParams.get("id"); // Ambil ID dari URL
