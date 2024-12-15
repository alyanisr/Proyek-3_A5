let linkModal = new bootstrap.Modal(document.getElementById("linkModal"));
let links = [];

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (idLinktree) {
    const savedLinks = localStorage.getItem(idLinktree);
    if (savedLinks) {
      links = JSON.parse(savedLinks);
      renderLinks();
    }
  }

  // Add error handling and logging
  try {
    initializeBackgroundImages();
    fetchLinktreeData();
  } catch (error) {
    console.error("Initialization error:", error);
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
  const form = document.getElementById("linkForm");
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  // Get input values
  const title = document.getElementById("linkTitle").value.trim();
  const url = document.getElementById("linkUrl").value.trim();
  const index = document.getElementById("linkIndex").value;

  // Validate input
  if (!title || !url) {
    alert("Title and Destination URL are required.");
    return;
  }

  // Check for duplicate links (ignore if updating existing)
  const isDuplicateLink = links.some(
    (link, i) => link.url === url && i !== parseInt(index)
  );
  if (isDuplicateLink) {
    alert("This link already exists. Please enter a different URL.");
    return;
  }

  // Generete unique shortlink ID
  const buttonPosition = index === "" ? links.length : parseInt(index);
  const shortlinkId = `(${title.toLowerCase()},${buttonPosition},${idLinktree},${generateRandomString(
    4
  )})`;

  // Prepare link data with complete shortlink information
  const linkData = {
    button_name: title,
    button_position: buttonPosition.toString(),
    long_url: url,
    id_shortlink: shortlinkId,

    short: title.toLowerCase().replace(/\s+/g, "-").slice(0, 10),
  };

  if (index === "") {
    // Add new link
    links.push(linkData);
  } else {
    // Update existing link
    links[index] = { ...links[index], ...linkData };
  }

  // Save to localStorage
  if (idLinktree) {
    localStorage.setItem(idLinktree, JSON.stringify(links));
  }

  window.links = links;

  // Render links and create buttons
  renderLinks();
  renderButtons(links); // Pass links array to render buttons

  linkModal.hide();
  form.reset();
}

// Helper function to generate random string
function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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
    if (data.btnArray && data.style) {
      await renderButtons(data.btnArray, data.style);
    }
  } catch (error) {
    console.error("Error loading linktree data:", error);
    alert("Failed to load links. Please try again later.");
  }
}

// Add this function to load design data from the database
async function loadDesignData() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (!idLinktree) {
    console.error("No Linktree ID found");
    return;
  }

  try {
    const response = await fetch(`/linktree/get/${idLinktree}`);
    const data = await response.json();

    console.log("Loaded Design Data:", data); // Detailed logging

    if (!data.style) {
      console.warn("No style data found in response");
      return;
    }

    // More robust application of design elements
    if (data.title) {
      titleInput.value = data.title;
      previewUsername.textContent = data.title || "@username";
    }

    if (data.bio) {
      bioInput.value = data.bio;
      document.getElementById("previewBio").textContent = data.bio;
    }

    // Apply theme with fallback
    if (data.style.theme) {
      activeThemeType = data.style.theme.type || "gradient";
      themeValue[activeThemeType] = data.style.theme.value || {
        color1: "#4158d0",
        color2: "#c850c0",
      };
      await applyTheme(activeThemeType, themeValue[activeThemeType]);
    }

    // Profile image handling
    if (data.style.profileImage) {
      currentProfileImage = data.style.profileImage;
      await updateProfileImage(
        `data:image/jpeg;base64,${data.style.profileImage}`
      );
    }

    // Initialize fonts with active font from database
    if (data.style.font) {
      const fontFamily = data.style.font.family || "Inter";
      const fontColor = data.style.font.color || "#000000";

      // Initialize font options
      initializeFonts(fontFamily);

      // Apply font and color
      changeFont(fontFamily, fontColor);

      // Update color picker
      const fontColorPicker = document.getElementById("fontColorPicker");
      if (fontColorPicker) {
        fontColorPicker.value = fontColor;
      }
    }

    if (data.style && data.style.font && data.style.font.color) {
      const fontColor = data.style.font.color;
      changeFontColor(fontColor);
      const fontColorPicker = document.getElementById("fontColorPicker");
      if (fontColorPicker) fontColorPicker.value = fontColor;
    }

    // Button style application
    if (data.style.buttonStyle) {
      await changeButtonStyle(data.style.buttonStyle.shape || "standard");
      await changeButtonColor(data.style.buttonStyle.color || "#007bff");
    }

    // Render buttons with style data
    if (data.btnArray) {
      await renderButtons(data.btnArray, data.style);
    }
  } catch (error) {
    console.error("Comprehensive error in loadDesignData:", error);
  }
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
  const linksList = document.getElementById("linksList");
  if (!linksList) return;

  linksList.innerHTML = "";

  links.forEach((link, index) => {
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
  });

  // Always render buttons after updating links
  renderButtons(links);
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

async function renderButtons(buttonData = [], styleData = {}) {
  const previewLinks = document.getElementById("previewLinks");
  if (!previewLinks) {
    console.error("Preview links container not found!");
    return;
  }

  // Clear existing buttons first
  previewLinks.innerHTML = "";

  // Ensure buttonData is an array
  if (!Array.isArray(buttonData)) {
    buttonData = [buttonData]; // Convert single object to array
  }

  // Extract style information
  const buttonStyle = styleData?.buttonStyle || {
    shape: "standard",
    color: "#007bff",
  };

  const fontStyle = styleData?.font || {
    family: "Inter",
    color: "#000000",
  };

  for (const link of buttonData) {
    if (!link || !link.button_name) {
      console.warn("Skipping invalid link:", link);
      continue;
    }

    try {
      // Use long_url directly if provided
      let longUrl =
        link.long_url ||
        (link.id_shortlink
          ? `http://localhost:8000/${link.id_shortlink}`
          : "#");

      const previewLink = document.createElement("a");
      previewLink.href = longUrl;
      previewLink.className = "preview-link";
      previewLink.innerText = link.button_name || "Link";

      // Apply button styles
      applyButtonStyle(previewLink, buttonStyle.shape || "standard");
      previewLink.style.backgroundColor = buttonStyle.color || "#007bff";

      // Apply font styles
      previewLink.style.fontFamily = fontStyle.family || "Inter";
      previewLink.style.color = fontStyle.color || "#000000";

      // Additional styling
      previewLink.style.cursor = "pointer";
      previewLink.target = "_blank";
      previewLink.style.textDecoration = "none";
      previewLink.style.display = "block";
      previewLink.style.margin = "10px 0";
      previewLink.style.padding = "10px 20px";
      previewLink.style.textAlign = "center";
      previewLink.style.transition = "all 0.3s ease";

      // Add hover effect
      previewLink.onmouseover = function () {
        this.style.opacity = "0.8";
      };
      previewLink.onmouseout = function () {
        this.style.opacity = "1";
      };

      // Store additional attributes
      previewLink.setAttribute("data-button-name", link.button_name);
      previewLink.setAttribute("data-button-position", link.button_position);
      previewLink.setAttribute("data-id-shortlink", link.id_shortlink);

      // Store style data as attributes for tracking
      previewLink.setAttribute("data-button-style", buttonStyle.shape);
      previewLink.setAttribute("data-button-color", buttonStyle.color);
      previewLink.setAttribute("data-font-family", fontStyle.family);
      previewLink.setAttribute("data-font-color", fontStyle.color);

      previewLinks.appendChild(previewLink);
    } catch (error) {
      console.error("Error creating button:", error);
    }
  }
}

// Panggil fetchLinktreeData saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchLinktreeData);

// Get DOM elements
const titleInput = document.getElementById("titleInput");
const bioInput = document.getElementById("bioInput");
const previewUsername = document.getElementById("previewUsername");
const fontColorPicker = document.getElementById("fontColorPicker");

// Function to update all preview text colors
function updatePreviewTextColors(color) {
  const previewContent = document.getElementById("previewContent");
  const previewUsername = document.getElementById("previewUsername");
  const previewBio = document.getElementById("previewBio");
  const previewElements = [previewContent, previewUsername, previewBio];

  previewElements.forEach((element) => {
    if (element) {
      element.style.color = color;
    }
  });
}

// Update font color when color picker changes
fontColorPicker.addEventListener("input", function (e) {
  updatePreviewTextColors(e.target.value);
});

// Update display name in preview with current font color
titleInput.addEventListener("input", function () {
  const currentColor = fontColorPicker.value || "#000000";
  previewUsername.textContent = this.value || "@username";
  previewUsername.style.color = currentColor;
});

// Update bio in preview with current font color
bioInput.addEventListener("input", function () {
  const currentColor = fontColorPicker.value || "#000000";
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
  previewBio.style.color = currentColor;
});

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
function changeFont(fontFamily, fontColor = null) {
  if (!fontFamily) return; // Prevent empty value override
  console.log("changeFont called with font:", fontFamily);
  console.log("Font color picker:", document.getElementById("fontColorPicker"));

  // Update font options active state
  document.querySelectorAll(".font-option").forEach((option) => {
    option.classList.remove("active");
    if (option.textContent === fontFamily) {
      option.classList.add("active");
    }
  });

  const previewUsername = document.getElementById("previewUsername");
  const previewBio = document.getElementById("previewBio");
  const fontColorPicker = document.getElementById("fontColorPicker");

  if (previewContent) {
    previewContent.style.fontFamily = fontFamily;
  }

  // Apply font color if provided, otherwise use the color picker value
  const color =
    fontColor || (fontColorPicker ? fontColorPicker.value : "#000000");

  console.log("Selected color:", color);

  if (previewUsername) {
    console.log("Updating username color");
    previewUsername.style.color = color;
  }
  if (previewBio) previewBio.style.color = color;
  if (previewContent) previewContent.style.color = color;
}

// Modify font color picker event listener
document.addEventListener("DOMContentLoaded", () => {
  const fontColorPicker = document.getElementById("fontColorPicker");
  if (fontColorPicker) {
    console.log("Font color picker event listener added");
    fontColorPicker.addEventListener("input", function () {
      console.log("Font color changed to:", this.value);
      const activeFontOption = document.querySelector(".font-option.active");
      const currentFont = activeFontOption
        ? activeFontOption.textContent
        : "Inter";
      changeFont(currentFont);
    });
  } else {
    console.error("Font color picker not found!");
  }
});

// Change font color function
function changeFontColor(color) {
  if (!color) return;

  // Update color picker value
  const fontColorPicker = document.getElementById("fontColorPicker");
  if (fontColorPicker) {
    fontColorPicker.value = color;
  }

  // Apply color to preview elements
  const previewUsername = document.getElementById("previewUsername");
  const previewBio = document.getElementById("previewBio");
  const previewLinks = document.querySelectorAll(".preview-link");
  const previewContent = document.getElementById("previewContent");

  // Pastikan warna dapat diterapkan bahkan jika elemen belum ada
  if (!previewUsername) {
    console.warn("previewUsername not found");
  }
  if (!previewBio) {
    console.warn("previewBio not found");
  }

  if (previewUsername) previewUsername.style.color = color;
  if (previewBio) previewBio.style.color = color;
  if (previewContent) {
    // Pastikan semua teks di dalam previewContent mengikuti warna yang sama
    const textElements = previewContent.querySelectorAll(
      "*:not(.preview-link)"
    );
    textElements.forEach((element) => {
      element.style.color = color;
    });
  }

  previewLinks.forEach((link) => {
    link.style.color = color;
  });
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
      // Store only the path/URL of the image
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
