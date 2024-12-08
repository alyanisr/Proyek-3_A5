let linkModal = new bootstrap.Modal(document.getElementById("linkModal"));
let links = [];

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (idLinktree) {
    // Coba ambil data dari localStorage berdasarkan idLinktree
    const savedLinks = localStorage.getItem(idLinktree);
    if (savedLinks) {
      links = JSON.parse(savedLinks);
      renderLinks(); // Ini akan sekaligus render linksList dan previewLinks
    }
  }

  // Muat data dari server sebagai cadangan
  fetchLinktreeData();
});

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

// // At the top of buildold.js, expose links array globally
// window.links = links;

// Modify the saveLink function to keep the short URL fixed
// Gabungan fungsi saveLink dari dua versi
function saveLink() {
  const form = document.getElementById("linkForm");
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  // Ambil nilai input
  const title = document.getElementById("linkTitle").value.trim();
  const url = document.getElementById("linkUrl").value.trim();
  const index = document.getElementById("linkIndex").value;

  // Validasi input
  if (!title || !url) {
    alert("Title and Destination URL are required.");
    return;
  }

  // Cek duplikasi URL (mengabaikan jika URL sedang diupdate)
  const isDuplicateLink = links.some(
    (link, i) => link.url === url && i !== parseInt(index)
  );
  if (isDuplicateLink) {
    alert("This link already exists. Please enter a different URL.");
    return;
  }

  // Persiapkan data link
  const linkData = {
    title: title,
    url: url,
    short: title.toLowerCase().replace(/\s+/g, "-").slice(0, 10), // Gunakan short URL berdasarkan title
  };

  if (index === "") {
    // Tambah link baru
    links.push(linkData);
  } else {
    // Update link yang sudah ada
    links[index] = { ...links[index], ...linkData }; // Update data sambil menjaga short URL tetap sama
  }

  // Simpan data ke localStorage berdasarkan id_linktree
  if (idLinktree) {
    localStorage.setItem(idLinktree, JSON.stringify(links));
  }

  window.links = links;

  renderLinks();
  linkModal.hide();
  form.reset();
}

function clearLocalStorageIfNeeded() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  // Hapus data yang tidak sesuai dengan id_linktree saat ini
  Object.keys(localStorage).forEach((key) => {
    if (key !== idLinktree) {
      localStorage.removeItem(key);
    }
  });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const saveLinkButton = document.getElementById("saveLinkButton");
  if (saveLinkButton) {
    saveLinkButton.addEventListener("click", saveLink);
  }

  const saveChangesButton = document.getElementById("saveChangesButton");
  if (saveChangesButton) {
    saveChangesButton.addEventListener("click", saveChanges);
  }

  // Initialize other components
  fetchLinktreeData();
});

// Tambahkan fungsi untuk memuat ulang data dari database saat halaman dimuat
function loadLinktreeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (!idLinktree) {
    console.error("Tidak ada ID Linktree");
    return;
  }

  // Cek localStorage terlebih dahulu
  const localLinks = localStorage.getItem(idLinktree);
  if (localLinks) {
    links = JSON.parse(localLinks);
    renderLinks();
  }

  // Kemudian muat dari server sebagai cadangan/sinkronisasi
  fetch(`/linktree/get/${idLinktree}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.buttonData && data.buttonData.length > 0) {
        links = data.buttonData;
        localStorage.setItem(idLinktree, JSON.stringify(links));
        renderLinks();
      }
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

  linksList.innerHTML = "";
  previewLinks.innerHTML = "";

  links.forEach((link, index) => {
    // Buat elemen kartu link
    const linkItem = document.createElement("div");
    linkItem.className = "card mb-3";
    linkItem.innerHTML = `
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0">${link.title}</h6>
          <small class="text-muted">${link.url}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2" 
                  onclick="showEditLinkModal(${index})" aria-label="Edit link ${link.title}">
            Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="deleteLink(${index})" aria-label="Delete link ${link.title}">
            Delete
          </button>
        </div>
      </div>
    `;

    linksList.appendChild(linkItem);

    // Buat elemen pratinjau link
    const previewLink = document.createElement("a");
    previewLink.href = link.url;
    previewLink.className = "preview-link";
    previewLink.innerText = link.title;
    previewLinks.appendChild(previewLink);
  });
}

// Edit Link Modal
function showEditLinkModal(index) {
  console.log("Edit modal triggered for index:", index);
  if (!links[index]) {
    console.error("Link data not found for index:", index);
    return;
  }
  const link = links[index];
  document.getElementById("modalTitle").textContent = "Edit Link";
  document.getElementById("linkIndex").value = index;
  document.getElementById("linkTitle").value = link.title;
  document.getElementById("linkUrl").value = link.url;
  linkModal.show(); // This is the critical line
}

function deleteLink(index) {
  if (confirm("Are you sure you want to delete this link?")) {
    const urlParams = new URLSearchParams(window.location.search);
    const idLinktree = urlParams.get("id");

    links.splice(index, 1);

    if (idLinktree) {
      localStorage.setItem(idLinktree, JSON.stringify(links));
    }

    renderLinks();
  }
}

// Ambil Linktree ID dari URL
function getLinktreeId() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    console.error("Linktree ID tidak ditemukan di URL!");
    alert("Invalid Linktree ID. Please check the URL.");
  }

  return id;
}

// Simpan ID di localStorage atau variabel global agar bisa diakses di file lain
let linktreeId = getLinktreeId();

// Fungsi untuk mengambil data dari API
async function fetchLinktreeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

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
    console.log("Received data:", data);

    // Broadcast button data to other scripts
    const buttonDataEvent = new CustomEvent("buttonDataReceived", {
      detail: {
        buttonData: data.buttonData || [],
        linktreeId: id,
      },
    });
    window.dispatchEvent(buttonDataEvent);

    // Render tombol berdasarkan data buttonData
    renderButtons(data.buttonData || []);
  } catch (error) {
    console.error("Error loading buttons:", error);
    alert("Gagal memuat link. Silakan coba lagi nanti.");
  }
}

function renderButtons(buttonData = []) {
  const previewLinks = document.getElementById("previewLinks");

  if (!previewLinks) {
    console.error("Preview links container not found!");
    return;
  }

  // Bersihkan konten sebelumnya
  previewLinks.innerHTML = "";

  // Pastikan buttonData adalah array
  if (!Array.isArray(buttonData)) {
    console.error("Invalid button data:", buttonData);
    return;
  }

  buttonData.forEach((button) => {
    if (!button || !button.title || !button.url) {
      console.warn("Skipping invalid button:", button);
      return;
    }

    const previewLink = document.createElement("a");
    previewLink.href = button.url;
    previewLink.className = "preview-link";
    previewLink.innerText = button.title;
    previewLinks.appendChild(previewLink);
  });
}

// Panggil fetchLinktreeData saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchLinktreeData);

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

// Add this variable to store the current profile image
let currentProfileImage = null;

// Update the handleImageUpload function
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    try {
      const base64String = await fileToBase64(file);
      currentProfileImage = base64String;

      // Update preview dan actual image
      updateProfileImage(`data:${file.type};base64,${base64String}`);

      // Simpan di window object untuk collectDesignData
      window.currentProfileImageBase64 = base64String;

      // Tutup modal
      bootstrap.Modal.getInstance(
        document.getElementById("imageOptionsModal")
      ).hide();
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please check the file and try again.");
    }
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
    // Apply to all text elements including username, bio
    previewContent.style.color = color;

    // Explicitly set color for text elements
    const textElements = previewContent.querySelectorAll(
      "#previewUsername, #previewBio, .text-white"
    );
    textElements.forEach((element) => {
      element.style.setProperty("color", color, "important");
    });

    // Apply to preview links (buttons)
    const previewLinks = document.querySelectorAll(".preview-link");
    previewLinks.forEach((link) => {
      link.style.setProperty("color", color, "important");
      // Store the color as data attribute for tracking
      link.setAttribute("data-font-color", color);
    });
  }
}

// Button style management
function changeButtonStyle(style) {
  const previewLinks = document.querySelectorAll(".preview-link");
  const buttons = document.querySelectorAll(".block-shape");

  // Remove active class from all button style options
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    // Reset data-style attribute
    btn.removeAttribute("data-style");
  });

  // Add active class and data-style to selected style
  const selectedButton = document.querySelector(
    `.block-shape[onclick="changeButtonStyle('${style}')"]`
  );
  if (selectedButton) {
    selectedButton.classList.add("active");
    selectedButton.setAttribute("data-style", style);
  }

  // Apply button style to preview links
  previewLinks.forEach((link) => {
    applyButtonStyle(link, style);
    // Tambahkan atribut data untuk tracking
    link.setAttribute("data-button-style", style);
  });
}

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
    // Set background color
    link.style.backgroundColor = color;
    // Tambahkan data attribute untuk tracking
    link.setAttribute("data-button-color", color);
  });
}

// Theme management

// Update theme sections to show which is active
function updateActiveThemeSection() {
  const sections = {
    gradient: document.getElementById("gradientSection"),
    solid: document.getElementById("solidSection"),
    image: document.getElementById("imageSection"),
  };

  // Update active section styling
  Object.keys(sections).forEach((type) => {
    if (sections[type]) {
      if (type === activeThemeType) {
        sections[type].classList.add("active-section");
      } else {
        sections[type].classList.remove("active-section");
      }
    }
  });

  // Update theme options active state
  document.querySelectorAll(".theme-option").forEach((option) => {
    option.classList.remove("active");
  });
  document.querySelectorAll(".image-option").forEach((option) => {
    option.classList.remove("active");
  });
}

// Update theme management
let activeThemeType = "gradient"; // 'gradient', 'solid', or 'image'
let themeValue = {
  gradient: {
    color1: "#4158d0",
    color2: "#c850c0",
  },
  solid: "#3498db",
  image: null,
};

// Update the applyTheme function
function applyTheme(type, value) {
  const previewContent = document.getElementById("previewContent");
  if (!previewContent) return;

  activeThemeType = type;
  themeValue[type] = value;

  switch (type) {
    case "gradient":
      previewContent.style.backgroundImage = `linear-gradient(to bottom, ${value.color1}, ${value.color2})`;
      previewContent.style.backgroundColor = "";
      break;
    case "solid":
      previewContent.style.backgroundImage = "none";
      previewContent.style.backgroundColor = value;
      break;
    case "image":
      previewContent.style.backgroundImage = `url('${value}')`;
      previewContent.style.backgroundSize = "cover";
      previewContent.style.backgroundPosition = "center";
      previewContent.style.backgroundColor = "";
      break;
  }

  updateActiveThemeSection();
}

// Handle gradient theme selection
function handleGradientSelect(color1, color2) {
  applyTheme("gradient", { color1, color2 });
}

// Handle solid color selection
function handleSolidSelect(color) {
  applyTheme("solid", color);
}

// Handle image selection
function handleImageSelect(imageUrl) {
  applyTheme("image", imageUrl);
}

// Custom gradient input handler
function handleCustomGradient() {
  const color1 = document.getElementById("gradientColor1").value;
  const color2 = document.getElementById("gradientColor2").value;
  handleGradientSelect(color1, color2);
}

// Custom solid color input handler
function handleCustomSolid() {
  const color = document.getElementById("solidColor").value;
  handleSolidSelect(color);
}

// Initialize theme sections
document.addEventListener("DOMContentLoaded", () => {
  // Set default theme
  applyTheme("gradient", themeValue.gradient);
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
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (!idLinktree) {
    alert("ID Linktree tidak ditemukan di URL!");
    return;
  }

  try {
    // Collect design data (from the second file's implementation)
    const designData = await collectDesignData();

    const jsonData = {
      title: designData.title || "",
      bio: designData.bio || "",
      style: {
        ...designData.style,
        profileImage: designData.style.profileImage || null,
        theme: {
          type: activeThemeType,
          value: themeValue[activeThemeType],
        },
      },
      btnArray: links.map((link) => ({
        name: link.title,
        url: link.url,
        short: link.short,
      })),
    };

    const response = await fetch(
      `http://localhost:8000/linktree/save?id=${idLinktree}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      }
    );

    if (response.ok) {
      alert("Perubahan berhasil disimpan!");
    } else {
      const errorText = await response.text();
      throw new Error(`Save failed: ${errorText}`);
    }
  } catch (error) {
    console.error("Error saving changes:", error);
    alert(`Terjadi kesalahan: ${error.message}`);
  }
}

async function collectDesignData() {
  try {
    // Tambahkan pengecekan elemen
    const titleInput = document.getElementById("titleInput");
    const bioInput = document.getElementById("bioInput");
    const previewContent = document.getElementById("previewContent");
    const previewLinks = document.querySelector(".preview-link");

    const profileImageInput = document.getElementById("profileImageInput");
    // Profile Image Handling
    let profileImageBase64 = null;

    // Prioritas:
    // 1. Resize gambar yang baru diunggah
    // 2. Gunakan base64 yang sudah tersimpan
    // 3. Gunakan gambar profil saat ini
    if (profileImageInput && profileImageInput.files.length > 0) {
      const file = profileImageInput.files[0];
      profileImageBase64 = await fileToBase64(file);
    } else if (window.currentProfileImageBase64) {
      profileImageBase64 = window.currentProfileImageBase64;
    } else if (currentProfileImage) {
      profileImageBase64 = currentProfileImage;
    }

    if (!titleInput || !bioInput || !previewContent) {
      throw new Error("Required design elements not found");
    }

    // Background data collection
    let backgroundData = {};
    const gradientColor1 = document.getElementById("gradientColor1");
    const gradientColor2 = document.getElementById("gradientColor2");
    const solidColor = document.getElementById("solidColor");

    if (previewContent.style.backgroundImage) {
      const selectedBgUrl = previewContent.style.backgroundImage.replace(
        /url\(['"](.+)['"]\)/,
        "$1"
      );

      backgroundData = {
        type: "background-image",
        value: selectedBgUrl,
      };
    } else if (previewContent.style.background.includes("gradient")) {
      backgroundData = {
        type: "gradient-color",
        value: {
          color1: gradientColor1 ? gradientColor1.value : "#4158d0",
          color2: gradientColor2 ? gradientColor2.value : "#c850c0",
        },
      };
    } else {
      backgroundData = {
        type: "solid-color",
        value: solidColor ? solidColor.value : "#3498db",
      };
    }

    // Handle background image conversion
    if (activeThemeType === "image") {
      const imageUrl = themeValue["image"];
      if (imageUrl && imageUrl.startsWith("/assets/")) {
        try {
          // Convert local image URL to base64
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const base64 = await fileToBase64(blob);
          themeValue["image"] = `data:${blob.type};base64,${base64}`;
        } catch (error) {
          console.error("Error converting background image:", error);
        }
      }
    }

    // Button style collection
    const activeButtonStyle = document.querySelector(".block-shape.active");
    const buttonStyleValue = activeButtonStyle
      ? activeButtonStyle.getAttribute("data-style") || "standard"
      : "standard";

    // Button color collection
    const buttonColor = previewLinks
      ? previewLinks.style.backgroundColor || "#007bff"
      : "#007bff";

    // Font collection
    const activeFontOption = document.querySelector(".font-option.active");
    const fontFamily = activeFontOption
      ? activeFontOption.textContent
      : "Inter";

    const designData = {
      title: titleInput.value || "",
      bio: bioInput.value || "",
      style: {
        profileImage: profileImageBase64,
        theme: {
          // Changed from background to theme
          type: activeThemeType,
          value: themeValue[activeThemeType],
        },
        buttonStyle: {
          shape: buttonStyleValue,
          color: buttonColor,
        },
        font: {
          family: fontFamily,
          color: document.querySelector("#fontColorPicker").value || "#000000", // Add font color
        },
      },
    };

    return designData;
  } catch (error) {
    console.error("Error collecting design data:", error);
    throw error;
  }
}

// Fungsi untuk resize gambar menggunakan canvas
function resizeImage(file, maxWidth = 300, maxHeight = 300) {
  // Reduced max dimensions
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Increase compression by reducing quality
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg", // Force JPEG format for better compression
          0.5 // Reduced quality to 50%
        );
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Fungsi untuk konversi file ke base64 dengan resize
async function fileToBase64(file) {
  try {
    // Resize gambar terlebih dahulu
    const resizedBlob = await resizeImage(file);

    // Konversi blob ke base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ambil base64 tanpa header data URL
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(resizedBlob);
    });
  } catch (error) {
    console.error("Error converting file to base64:", error);
    throw error;
  }
}

// Fungsi konversi URL ke base64 dengan resize
async function urlToBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Untuk menghandle CORS

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Resize gambar
      const maxWidth = 800;
      const maxHeight = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Gambar ulang dengan ukuran baru
      ctx.drawImage(img, 0, 0, width, height);

      // Convert ke base64
      resolve(canvas.toDataURL("image/jpeg", 0.7).split(",")[1]);
    };

    img.onerror = reject;
    img.src = url;
  });
}

// Tambahkan event listener untuk menyimpan perubahan
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveChangesButton"); // Pastikan ada tombol dengan ID ini di HTML
  if (saveButton) {
    saveButton.addEventListener("click", saveChanges);
  }
});
