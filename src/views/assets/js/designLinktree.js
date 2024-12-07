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

// Ambil Linktree ID dari localStorage atau URL
function getLinktreeId() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    console.error("Linktree ID tidak ditemukan di URL!");
    alert("Invalid Linktree ID. Please check the URL.");
  }

  return id;
}

// Global variables to store button data and linktree ID
let buttonData = [];
let currentLinktreeId = getLinktreeId();

// Listen for button data from buildold.js
window.addEventListener("buttonDataReceived", (event) => {
  buttonData = event.detail.buttonData;
  currentLinktreeId = event.detail.linktreeId;
  console.log("Received Button Data:", buttonData);
});

async function saveChanges() {
  try {
    // Validate currentLinktreeId
    if (!currentLinktreeId) {
      throw new Error("Linktree ID tidak ditemukan!");
    }

    // Validate designData collection
    const designData = await collectDesignData();
    if (!designData) {
      throw new Error("Gagal mengumpulkan data desain!");
    }

    // Prepare data for sending
    const jsonData = {
      title: designData.title || "",
      bio: designData.bio || "",
      style: {
        ...designData.style,
        profileImage: designData.style.profileImage || null,
        background: designData.style.background || {},
      },
      btnArray: buttonData || [], // Ensure btnArray is always an array
    };

    const response = await fetch(
      `http://localhost:8000/linktree/save?id=${currentLinktreeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      }
    );

    if (!response.ok) {
      // Try to get more details about the error
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    alert("Perubahan berhasil disimpan!");
  } catch (error) {
    console.error("Detailed error:", error);
    alert(`Terjadi kesalahan: ${error.message}`);
  }
}

// Fungsi untuk konversi file ke base64 dengan buffer
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Konversi ArrayBuffer ke base64
      const base64String = btoa(
        new Uint8Array(reader.result).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function collectDesignData() {
  try {
    // Pastikan elemen-elemen yang dibutuhkan ada
    const titleInput = document.getElementById("titleInput");
    const bioInput = document.getElementById("bioInput");
    const previewContent = document.getElementById("previewContent");

    if (!titleInput || !bioInput || !previewContent) {
      throw new Error("Beberapa elemen input tidak ditemukan!");
    }

    // Collect background data
    let backgroundData = {};
    const gradientColor1 = document.getElementById("gradientColor1");
    const gradientColor2 = document.getElementById("gradientColor2");
    const solidColor = document.getElementById("solidColor");

    if (previewContent.style.backgroundImage) {
      // Jika background adalah gambar
      const selectedBgUrl = previewContent.style.backgroundImage.replace(
        /url\(['"](.+)['"]\)/,
        "$1"
      );

      try {
        const base64BackgroundImage = await urlToBase64(selectedBgUrl);
        backgroundData = {
          type: "image",
          value: base64BackgroundImage,
        };
      } catch (error) {
        console.error("Error converting background image:", error);
        backgroundData = {
          type: "image",
          value: null,
        };
      }
    } else if (previewContent.style.background.includes("gradient")) {
      // Jika background adalah gradient
      backgroundData = {
        type: "gradient",
        value: {
          color1: gradientColor1 ? gradientColor1.value : "#4158d0",
          color2: gradientColor2 ? gradientColor2.value : "#c850c0",
        },
      };
    } else {
      // Jika background adalah warna solid
      backgroundData = {
        type: "solid",
        value: solidColor ? solidColor.value : "#3498db",
      };
    }

    // Collect design data
    const designData = {
      title: titleInput.value || "",
      bio: bioInput.value || "",
      style: {
        profileImage: window.currentProfileImageBase64 || null,
        background: backgroundData,
        buttonStyle: {
          shape:
            document
              .querySelector(".block-shape.active")
              ?.getAttribute("data-style") || "standard",
          color:
            document.getElementById("buttonColorPicker").value
              ?.backgroundColor || "#007bff",
        },
        font: {
          family:
            document.querySelector(".font-option.active")?.textContent ||
            "Inter",
          color:
            document.getElementById("fontColorPicker").value
              ?.color || "#000000",
        },
      },
    };

    return designData;
  } catch (error) {
    console.error("Error collecting design data:", error);
    throw error;
  }
}

// Tambahkan fungsi pendukung jika belum ada
async function urlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    return null;
  }
}
// Tambahkan event listener untuk menyimpan perubahan
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveChangesButton"); // Pastikan ada tombol dengan ID ini di HTML
  if (saveButton) {
    saveButton.addEventListener("click", saveChanges);
  }
});
