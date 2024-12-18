let linkModal = new bootstrap.Modal(document.getElementById("linkModal"));
let links = [];
let initialLoad = true;
let hasUnsavedChanges = false;

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

// Track changes on input fields
["titleInput", "bioInput", "linkTitle", "linkUrl"].forEach((id) => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener("input", () => {
      hasUnsavedChanges = true;
    });
  }
});

// Prevent accidental tab/window close
window.addEventListener("beforeunload", (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault(); // Standard way to show browser's default warning
    e.returnValue = ""; // Required for Chrome
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (!idLinktree) {
    console.error("No Linktree ID found");
    return;
  }

  try {
    // First check localStorage for any unsaved changes
    const localLinks = localStorage.getItem(idLinktree);
    if (localLinks) {
      links = JSON.parse(localLinks);
    } else {
      // If no local changes, fetch from database
      const response = await fetch(`/linktree/get/${idLinktree}`);
      const data = await response.json();
      if (data.buttonData && data.buttonData.length > 0) {
        links = data.buttonData;
        // Store in localStorage
        localStorage.setItem(idLinktree, JSON.stringify(links));
      }
    }

    // Render both the link list and preview buttons
    await loadDesignData();
    renderLinks();

    initialLoad = false;
    initializeBackgroundImages();
    fetchLinktreeData();
  } catch (error) {
    console.error("Error loading data:", error);
  }
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
function saveLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  const title = document.getElementById("linkTitle").value.trim();
  const url = document.getElementById("linkUrl").value.trim();
  const index = document.getElementById("linkIndex").value;

  if (!title || !url) {
    alert("Title and URL are required.");
    return;
  }

  const linkData = {
    title: title,
    url: url,
    short: title.toLowerCase().replace(/\s+/g, "-").slice(0, 10),
  };

  if (index === "") {
    links.push(linkData);
  } else {
    links[index] = { ...links[index], ...linkData };
  }

  // Save to localStorage
  if (idLinktree) {
    localStorage.setItem(idLinktree, JSON.stringify(links));
  }

  // Update both list and preview immediately
  renderLinks();

  linkModal.hide();
  document.getElementById("linkForm").reset();
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
async function loadLinktreeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (!idLinktree) {
    console.error("No Linktree ID found");
    return;
  }

  // Check localStorage first
  const localLinks = localStorage.getItem(idLinktree);
  if (localLinks) {
    links = JSON.parse(localLinks);
    renderLinks(); // Only render the edit panel links
  }

  try {
    const response = await fetch(`/linktree/get/${idLinktree}`);
    const data = await response.json();

    if (data.buttonData && data.buttonData.length > 0) {
      links = data.buttonData;
      localStorage.setItem(idLinktree, JSON.stringify(links));
      renderLinks(); // Update edit panel links
    }

    // Update button data for other scripts
    const buttonDataEvent = new CustomEvent("buttonDataReceived", {
      detail: {
        buttonData: data.btnArray || [],
        linktreeId: idLinktree,
      },
    });
    window.dispatchEvent(buttonDataEvent);

    // Render preview buttons with style data
    if (data.buttonData && data.style) {
      await renderButtons(data.buttonData, data.style);
    }
  } catch (error) {
    console.error("Error loading linktree data:", error);
    alert("Failed to load links. Please try again later.");
  }
}

async function loadDesignData() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (!idLinktree) {
    console.error("No Linktree ID found");
    return;
  }

  try {
    const response = await fetch(`/linktree/get/${idLinktree}`);
    if (!response.ok) {
      throw new Error("Failed to fetch design data");
    }

    const data = await response.json();
    console.log("API Data:", data); // Debug: lihat isi data

    // Pastikan data font dan style tersedia
    if (!data || !data.style || !data.style.font) {
      throw new Error("Incomplete design data from API");
    }

    // Terapkan font style dan color dari database
    const fontFamily = data.style.font.family || "Inter";
    const fontColor = data.style.font.color || "#000000";

    // Profile Image Handling
    if (data.style?.profileImage) {
      const profileImage = data.style.profileImage;

      // Pastikan profileImage adalah base64 atau URL yang valid
      if (profileImage) {
        updateProfileImage(`data:image/jpeg;base64,${profileImage}`);

        // Simpan di window object untuk collectDesignData
        window.currentProfileImageBase64 = profileImage;
      }
    }
    // Title and Bio
    const titleInput = document.getElementById("titleInput");
    const previewUsername = document.getElementById("previewUsername");
    const bioInput = document.getElementById("bioInput");
    const previewBio = document.getElementById("previewBio");

    if (titleInput && previewUsername) {
      titleInput.value = data.title || "My Linktree";
      previewUsername.textContent = data.title || "My Linktree";
      previewUsername.style.color = fontColor;
    }

    if (bioInput && previewBio) {
      bioInput.value = data.bio || "Welcome to my links!";
      previewBio.textContent = data.bio || "Welcome to my links!";
      previewBio.style.color = fontColor;
    }

    // Theme
    if (data.style?.theme) {
      applyTheme(data.style.theme.type, data.style.theme.value);
    }

    // Font
    if (data.style?.font) {
      const fontFamily = data.style.font.family || "Inter";
      const fontColor = data.style.font.color || "#000000";
      const fontWeight = data.style.font.weight || "normal"; // Pastikan berat font diatur

      changeFont(fontFamily, fontColor, fontWeight);

      // Update font color picker
      const fontColorPicker = document.getElementById("fontColorPicker");
      if (fontColorPicker) {
        fontColorPicker.value = fontColor;
      }
    }

    if (data.style?.font?.color) {
      changeFontColor(data.style.font.color, true);
    }

    // Button Style
    if (data.style?.buttonStyle) {
      const buttonColor = data.style.buttonStyle.color || "#007bff";
      const buttonShape = data.style.buttonStyle.shape || "standard";

      changeButtonColor(buttonColor);
      changeButtonStyle(buttonShape);
    }
  } catch (error) {
    console.warn("Error loading design data:", error);
    // Apply default settings
    applyTheme("gradient", { color1: "#4158d0", color2: "#c850c0" });
    changeFont("Inter", "#000000");
    changeButtonStyle("standard");
    changeButtonColor("#007bff");
  }
}

function showErrorModal(message, title = "Error") {
  // Create modal dynamically
  const modalHtml = `
    <div class="modal fade" id="errorModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if exists
  const existingModal = document.getElementById("errorModal");
  if (existingModal) existingModal.remove();

  // Append new modal to body
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
  errorModal.show();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Clear any existing buttons first
    const previewLinks = document.getElementById("previewLinks");
    if (previewLinks) {
      previewLinks.innerHTML = "";
    }

    // Load design data first (includes button style and color)
    await loadDesignData();

    // Then load linktree data (includes buttons)
    await loadLinktreeData();

    // Initialize other components
    initializeFonts();
    initializeBackgroundImages();
  } catch (error) {
    console.error("Initialization error:", error);
  }
});

function renderLinks() {
  // Retrieve stored styles
  const storedButtonColor = localStorage.getItem("buttonColor") || "#007bff";
  const storedButtonStyle = localStorage.getItem("buttonStyle") || "standard";
  const storedFontColor = localStorage.getItem("fontColor") || "#000000";
  const storedFont = localStorage.getItem("fontFamily") || "Inter";

  // Render link list
  const linksList = document.getElementById("linksList");
  if (linksList) {
    linksList.innerHTML = "";
    links.forEach((link, index) => {
      const truncatedTitle = truncateText(link.title, 50);
      const linkItem = document.createElement("div");
      linkItem.className = "card mb-3";
      linkItem.innerHTML = `
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-0" title="${link.title}">${truncatedTitle}</h6>
            <small class="text-muted" title="${link.url}">${truncateText(
        link.url,
        50
      )}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary me-2" onclick="showEditLinkModal(${index})">
              Edit
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteLink(${index})">
              Delete
            </button>
          </div>
        </div>
      `;
      linksList.appendChild(linkItem);
    });
  }

  // Render preview buttons
  const previewLinks = document.getElementById("previewLinks");
  if (previewLinks) {
    previewLinks.innerHTML = "";
    links.forEach((link) => {
      const previewLink = document.createElement("a");
      previewLink.href = link.url;
      previewLink.className = "preview-link";
      previewLink.innerText = link.title;

      // Apply persistent button styles
      applyButtonStyle(previewLink, storedButtonStyle);
      previewLink.style.backgroundColor = storedButtonColor;
      previewLink.style.color = storedFontColor;

      // Apply current font
      previewLink.style.fontFamily = storedFont;

      previewLink.target = "_blank";
      previewLinks.appendChild(previewLink);
    });
  }
}
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
// Ensure buttons are rendered on page load
document.addEventListener("DOMContentLoaded", () => {
  renderLinks();
});

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

    // Update localStorage
    if (idLinktree) {
      localStorage.setItem(idLinktree, JSON.stringify(links));
    }

    // Update both list and preview
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

    // Clear existing buttons before rendering
    const previewLinks = document.getElementById("previewLinks");
    if (previewLinks) {
      previewLinks.innerHTML = "";
    }

    // Broadcast button data to other scripts
    const buttonDataEvent = new CustomEvent("buttonDataReceived", {
      detail: {
        buttonData: data.btnArray || [],
        linktreeId: id,
      },
    });
    window.dispatchEvent(buttonDataEvent);

    // Render buttons with style and color
    if (data.btnArray) {
      await renderButtons(data.btnArray, data.style);
    }
  } catch (error) {
    console.error("Error loading buttons:", error);
    alert("Gagal memuat link. Silakan coba lagi nanti.");
  }
}

async function renderButtons(btnArray = [], styleData = {}) {
  const previewLinks = document.getElementById("previewLinks");
  if (!previewLinks) {
    console.error("Preview links container not found!");
    return;
  }

  // Clear existing buttons first
  previewLinks.innerHTML = "";

  // Jika btnArray kosong atau null, langsung return tanpa error
  if (!btnArray || btnArray.length === 0) {
    return;
  }

  // Default style values
  const defaultButtonStyle = styleData.buttonStyle?.shape || "standard";
  const defaultButtonColor = styleData.buttonStyle?.color || "#007bff";
  const fontFamily =
    styleData.font?.family || localStorage.getItem("fontFamily") || "Inter";
  const fontColor =
    styleData.font?.color || localStorage.getItem("fontColor") || "#000000";

  for (const button of btnArray) {
    if (!button?.button_name) continue;

    const previewLink = document.createElement("a");
    // Use long_url instead of url, with fallback
    previewLink.href = button.long_url || button.url || "#";
    previewLink.className = "preview-link";
    previewLink.innerText = button.button_name;

    // Apply default button styles from database
    applyButtonStyle(previewLink, defaultButtonStyle);
    previewLink.style.backgroundColor = defaultButtonColor;

    previewLink.style.fontFamily = fontFamily;
    previewLink.style.color = fontColor;

    previewLink.style.cursor = "pointer";
    previewLink.target = "_blank";

    previewLinks.appendChild(previewLink);
  }
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

  if (profileImage) {
    profileImage.src = imageUrl;
    profileImage.style.display = "block"; // Pastikan gambar ditampilkan
  }

  if (previewProfileImage) {
    previewProfileImage.src = imageUrl;
    previewProfileImage.style.display = "block"; // Pastikan gambar ditampilkan
  }
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
function initializeFonts(activeFont = "Inter") {
  const fontContainer = document.querySelector(".font-options");
  if (!fontContainer) {
    console.error("Font container not found");
    return;
  }

  fontContainer.innerHTML = "";

  fonts.forEach((font) => {
    const fontOption = document.createElement("div");
    fontOption.className = "font-option";
    if (font === activeFont) {
      fontOption.classList.add("active");
    }
    fontOption.textContent = font;
    fontOption.style.fontFamily = font;
    fontOption.onclick = () => changeFont(font);
    fontContainer.appendChild(fontOption);
  });
}

function initializeFontColor() {
  const fontColorPicker = document.getElementById("fontColorPicker");
  if (fontColorPicker) {
    const initialColor = fontColorPicker.value || "#000000";
    const previewUsername = document.getElementById("previewUsername");
    const previewBio = document.getElementById("previewBio");

    if (previewUsername) {
      previewUsername.style.color = initialColor;
    }
    if (previewBio) {
      previewBio.style.color = initialColor;
    }
  }
}

// Change font for preview content
function changeFontFamily(fontFamily = "Inter") {
  if (!fontFamily) return;

  // Update font options active state
  document.querySelectorAll(".font-option").forEach((option) => {
    option.classList.remove("active");
    if (option.textContent === fontFamily) {
      option.classList.add("active");
    }
  });

  // Apply font to preview elements
  const previewLinks = document.querySelectorAll(".preview-link");
  previewLinks.forEach((link) => {
    link.style.fontFamily = fontFamily;
  });

  const previewUsername = document.getElementById("previewUsername");
  const previewBio = document.getElementById("previewBio");

  if (previewUsername) previewUsername.style.fontFamily = fontFamily;
  if (previewBio) previewBio.style.fontFamily = fontFamily;
}

function changeFont(fontFamily, fontColor = "#000000", fontWeight = "normal") {
  fontFamily = fontFamily || "Inter"; // Default jika tidak ada font
  fontColor = fontColor || "#000000";
  fontWeight = fontWeight || "normal";

  // Ambil elemen-elemen untuk diperbarui
  const previewUsername = document.getElementById("previewUsername");
  const previewBio = document.getElementById("previewBio");
  const previewLinks = document.querySelectorAll(".preview-link");

  // Perbarui font pada elemen username dan bio
  if (previewUsername) {
    previewUsername.style.fontFamily = fontFamily;
    previewUsername.style.color = fontColor;
    previewUsername.style.fontWeight = fontWeight;
  }

  if (previewBio) {
    previewBio.style.fontFamily = fontFamily;
    previewBio.style.color = fontColor;
    previewBio.style.fontWeight = fontWeight;
  }

  // Perbarui semua tombol pratinjau
  previewLinks.forEach((link) => {
    link.style.fontFamily = fontFamily;
    link.style.color = fontColor;
    link.style.fontWeight = fontWeight;

    // Pastikan hover, klik, dan fokus mengikuti font
    link.addEventListener("mouseenter", () => {
      link.style.fontFamily = fontFamily;
      link.style.color = fontColor;
    });

    link.addEventListener("mouseleave", () => {
      link.style.fontFamily = fontFamily;
      link.style.color = fontColor;
    });

    link.addEventListener("mousedown", () => {
      link.style.fontWeight = "bold"; // Tambahkan efek bold pada klik
    });

    link.addEventListener("mouseup", () => {
      link.style.fontWeight = fontWeight; // Kembalikan ke berat font default
    });

    link.addEventListener("focus", () => {
      link.style.fontFamily = fontFamily;
      link.style.color = fontColor;
    });

    link.addEventListener("blur", () => {
      link.style.fontFamily = fontFamily;
      link.style.color = fontColor;
    });
  });

  // Simpan font dan warna ke localStorage untuk persistensi
  localStorage.setItem("fontFamily", fontFamily);
  localStorage.setItem("fontColor", fontColor);
}

document.addEventListener("DOMContentLoaded", async () => {
  const storedButtonColor = localStorage.getItem("buttonColor") || "#007bff";
  const storedButtonStyle = localStorage.getItem("buttonStyle") || "standard";

  // Ambil stored values
  const storedFontColor = localStorage.getItem("fontColor");
  const storedFont = localStorage.getItem("fontFamily");

  try {
    // Tunggu data dari database
    await loadDesignData();

    // Check if font data was loaded from database
    const fontColorFromDatabase =
      document.getElementById("fontColorPicker")?.value;

    // Prioritize database font color, then localStorage, then default
    const finalFontColor =
      fontColorFromDatabase || storedFontColor || "#000000";
    const finalFont = storedFont || "Inter";

    // Apply font and color
    changeFont(finalFont, finalFontColor);

    // Apply stored button style and color
    changeButtonStyle(storedButtonStyle);
    changeButtonColor(storedButtonColor);
  } catch (error) {
    console.error("Error initializing fonts:", error);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Tunggu data dari database
    await loadDesignData();

    // Pastikan font dan warna disetel dari database
    const storedFont = localStorage.getItem("fontFamily") || "Inter";
    const storedFontColor = localStorage.getItem("fontColor");

    // Prioritaskan data dari database
    const fontColorFromDatabase =
      document.getElementById("fontColorPicker")?.value;
    const finalFontColor =
      fontColorFromDatabase || storedFontColor || "#000000";

    // Apply font dan color, pastikan menggunakan warna dari database
    changeFont(storedFont, finalFontColor);
    await loadDesignData();
  } catch (error) {
    console.error("Error initializing fonts:", error);
  }
});

function changeFontColor(color, fromDatabase = false) {
  color = color || "#000000"; // Gunakan warna default jika tidak tersedia

  if (fromDatabase) {
    // Simpan status warna dari database ke localStorage
    localStorage.setItem("fontColorFromDatabase", color);
  }

  // Tentukan warna akhir
  const finalColor = color;

  // Perbarui color picker jika ada
  const fontColorPicker = document.getElementById("fontColorPicker");
  if (fontColorPicker) {
    fontColorPicker.value = finalColor;
  }

  // Terapkan warna ke elemen pratinjau
  const previewElements = [
    document.getElementById("previewUsername"),
    document.getElementById("previewBio"),
    ...document.querySelectorAll(".preview-link"),
  ];

  previewElements.forEach((element) => {
    if (element) {
      element.style.color = finalColor;
    }
  });

  // Simpan warna akhir
  localStorage.setItem("fontColor", finalColor);
}

// Tambahkan event listener untuk color picker
document.addEventListener("DOMContentLoaded", () => {
  const fontColorPicker = document.getElementById("fontColorPicker");
  if (fontColorPicker) {
    fontColorPicker.addEventListener("input", (e) => {
      // Saat user memilih warna sendiri, nonaktifkan mode dari database
      localStorage.removeItem("fontColorFromDatabase");
      changeFontColor(e.target.value);
    });
  }
});

// Pastikan inisialisasi font color saat load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Tunggu data dari database
    await loadDesignData();
  } catch (error) {
    console.error("Error initializing font color:", error);
  }
});

// When loading from database
if (data.style?.font?.color) {
  changeFontColor(data.style.font.color, true);
}

// Button style management
function changeButtonStyle(style) {
  const previewLinks = document.querySelectorAll(".preview-link");
  const buttons = document.querySelectorAll(".block-shape");

  // Reset and update button style options
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    btn.removeAttribute("data-style");
  });

  const selectedButton = document.querySelector(
    `.block-shape[onclick="changeButtonStyle('${style}')"]`
  );
  if (selectedButton) {
    selectedButton.classList.add("active");
    selectedButton.setAttribute("data-style", style);
  }

  // Apply style to preview links dynamically
  previewLinks.forEach((link) => {
    applyButtonStyle(link, style);
    link.setAttribute("data-button-style", style);
  });

  // Optional: Store in localStorage for persistence
  localStorage.setItem("buttonStyle", style);
}

// Similar enhancement for changeButtonColor
function changeButtonColor(color) {
  const previewLinks = document.querySelectorAll(".preview-link");

  previewLinks.forEach((link) => {
    link.style.backgroundColor = color;
    link.setAttribute("data-button-color", color);
  });

  // Persist in localStorage
  localStorage.setItem("buttonColor", color);
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

// Update the applyTheme function
function applyTheme(type, value) {
  type = type || "gradient";

  const previewContent = document.getElementById("previewContent");
  if (!previewContent) return;

  activeThemeType = type;
  themeValue[type] = value;

  switch (type) {
    case "gradient":
      // Ensure two colors are provided for gradient
      const color1 = value.color1 || "#4158d0";
      const color2 = value.color2 || "#c850c0";
      previewContent.style.backgroundImage = `linear-gradient(to bottom right, ${color1}, ${color2})`;
      previewContent.style.backgroundColor = "";
      previewContent.style.backgroundSize = "cover";
      break;

    case "solid":
      // Use provided color or default
      const solidColor = value || "#3498db";
      previewContent.style.backgroundImage = "none";
      previewContent.style.backgroundColor = solidColor;
      break;

    case "image":
      // Validate image URL
      if (value && typeof value === "string") {
        previewContent.style.backgroundImage = `url('${value}')`;
        previewContent.style.backgroundSize = "cover";
        previewContent.style.backgroundPosition = "center";
        previewContent.style.backgroundColor = "";
      }
      break;

    default:
      // Fallback to default gradient
      previewContent.style.backgroundImage =
        "linear-gradient(to bottom right, #4158d0, #c850c0)";
  }

  // Update UI to reflect current theme type
  updateActiveThemeSection();
}

function updateActiveThemeSection() {
  const sections = {
    gradient: document.getElementById("gradientSection"),
    solid: document.getElementById("solidSection"),
    image: document.getElementById("imageSection"),
  };

  // Reset all sections
  Object.keys(sections).forEach((type) => {
    if (sections[type]) {
      sections[type].classList.remove("active-section");
    }
  });

  // Activate current theme section
  if (sections[activeThemeType]) {
    sections[activeThemeType].classList.add("active-section");
  }
}

// Handle gradient theme selection
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

// Background image initialization
function initializeBackgroundImages() {
  const backgroundImages = [
    "/assets/img/masjid-lh.jpg",
    "/assets/img/Gedung-H2.jpg",
    "/assets/img/gedung-h3.jpg",
  ];

  const backgroundContainer = document.querySelector(".background-options");
  if (backgroundContainer) {
    backgroundContainer.innerHTML = "";
    backgroundImages.forEach((image) => {
      const imageOption = document.createElement("div");
      imageOption.className = "background-option";
      imageOption.style.backgroundImage = `url('${image}')`;
      imageOption.onclick = () => handleImageSelect(image);
      backgroundContainer.appendChild(imageOption);
    });
  }
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
document.addEventListener("DOMContentLoaded", async () => {
  initializeFonts();
  initializeBackgroundImages();

  // Tunggu data selesai di-load
  await loadDesignData();

  // Hanya set default jika tidak ada data dari database
  if (!document.getElementById("previewContent").style.backgroundImage) {
    if (backgroundImages.length > 0) {
      changeBackgroundImage(backgroundImages[0]);
    }
    changeFont("Inter");
    changeButtonStyle("standard");
    changeTheme("#4158d0", "#c850c0");

    document.getElementById("gradientColor1").value = "#4158d0";
    document.getElementById("gradientColor2").value = "#c850c0";
    document.getElementById("solidColor").value = "#3498db";
  }
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
      hasUnsavedChanges = false;
      showSuccessModal("Changes saved successfully!");
    } else {
      const errorText = await response.text();
      throw new Error(`Save failed: ${errorText}`);
    }
  } catch (error) {
    console.error("Error saving changes:", error);
    alert(`Terjadi kesalahan: ${error.message}`);
  }
}

function showSuccessModal(message) {
  const modalHtml = `
    <div class="modal fade" id="successModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">Success</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  successModal.show();
}

async function collectDesignData() {
  try {
    // Ensure all required elements exist
    const titleInput = document.getElementById("titleInput");
    const bioInput = document.getElementById("bioInput");
    const previewContent = document.getElementById("previewContent");
    const fontColorPicker = document.getElementById("fontColorPicker");

    // Validate existence of critical elements
    if (!titleInput || !bioInput || !previewContent || !fontColorPicker) {
      throw new Error("Required design elements are missing");
    }

    // Ensure activeThemeType and themeValue are defined with defaults
    const themeData = {
      type: activeThemeType,
      value: themeValue[activeThemeType],
    };

    const designData = {
      title: titleInput.value || "My Linktree",
      bio: bioInput.value || "Welcome to my links!",
      style: {
        theme: {
          type: activeThemeType,
          value: themeValue[activeThemeType],
        },
        font: {
          family: localStorage.getItem("fontFamily") || "Inter",
          color: fontColorPicker.value || "#000000",
        },
        buttonStyle: {
          color: localStorage.getItem("buttonColor") || "#007bff",
          shape: localStorage.getItem("buttonStyle") || "standard",
        },
        profileImage: window.currentProfileImageBase64 || null,
      },
    };

    return designData;
  } catch (error) {
    console.warn("Minor error collecting design data:", error);
    // Return a default design data object without throwing an error
    return {
      title: "My Linktree",
      bio: "Welcome to my links!",
      style: {
        theme: {
          type: "gradient",
          value: { color1: "#4158d0", color2: "#c850c0" },
        },
        font: {
          family: "Inter",
          color: "#000000",
        },
        buttonStyle: {
          color: "#007bff",
          shape: "standard",
        },
        profileImage: window.currentProfileImageBase64 || null,
      },
    };
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

// // Modifikasi event listener
// document.addEventListener("DOMContentLoaded", function () {
//   const editUrlButtons = document.querySelectorAll(".edit-url-btn");
//   editUrlButtons.forEach((button) => {
//     button.addEventListener("click", showEditUrlModal);
//   });

//   const updateUrlButton = document.getElementById("updateUrlButton");
//   if (updateUrlButton) {
//     updateUrlButton.addEventListener("click", updateLinktreeUrl);
//   }
// });

// function showEditUrlModal(event) {
//   try {
//     // Dapatkan tombol Edit URL yang diklik
//     const editButton = event.target;

//     // Ambil ID dari tombol Edit URL
//     const linktreeId = editButton.getAttribute("data-id");
//     if (!linktreeId) {
//       console.error("Linktree ID not found");
//       return;
//     }

//     // Set data-id pada tombol Update URL di modal
//     const updateButton = document.querySelector("#editUrlModal .btn-primary");
//     if (updateButton) {
//       updateButton.setAttribute("data-id", linktreeId);
//     }

//     // Tampilkan modal
//     if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
//       const editUrlModal = new bootstrap.Modal(
//         document.getElementById("editUrlModal")
//       );
//       editUrlModal.show();
//     } else {
//       console.error("Bootstrap Modal is not loaded");
//       alert("Unable to open modal. Please check your bootstrap library.");
//     }
//   } catch (error) {
//     console.error("Error showing modal:", error);
//     alert("An error occurred while opening the modal.");
//   }
// }

// function updateLinktreeUrl() {
//   // Ambil URL saat ini
//   const currentUrl = window.location.href;

//   // Ekstrak ID dari query parameter
//   const urlParams = new URLSearchParams(window.location.search);
//   const linktreeId = urlParams.get("id");

//   if (!linktreeId) {
//     alert("Invalid linktree ID");
//     return;
//   }

//   const newUrlInput = document.getElementById("newLinktreeUrl");
//   if (!newUrlInput || !newUrlInput.value) {
//     alert("Please enter a valid URL");
//     return;
//   }

//   const newUrl = newUrlInput.value;

//   fetch(`/linktree/edit-url?id=${linktreeId}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ url: newUrl }),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       alert("URL updated successfully");
//       const editUrlModal = bootstrap.Modal.getInstance(
//         document.getElementById("editUrlModal")
//       );
//       if (editUrlModal) {
//         editUrlModal.hide();
//       }
//     })
//     .catch((error) => {
//       console.error("Full error:", error);
//       alert(`Error: ${error.message}`);
//     });
// }

// Tambahkan event listener untuk menyimpan perubahan
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveChangesButton"); // Pastikan ada tombol dengan ID ini di HTML
  if (saveButton) {
    saveButton.addEventListener("click", saveChanges);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  // Gradient color inputs
  const gradientColor1 = document.getElementById("gradientColor1");
  const gradientColor2 = document.getElementById("gradientColor2");
  if (gradientColor1 && gradientColor2) {
    gradientColor1.addEventListener("input", handleGradientSelect);
    gradientColor2.addEventListener("input", handleGradientSelect);
  }

  // Solid color input
  const solidColor = document.getElementById("solidColor");
  if (solidColor) {
    solidColor.addEventListener("input", handleSolidSelect);
  }

  // Initialize background images
  initializeBackgroundImages();
});
