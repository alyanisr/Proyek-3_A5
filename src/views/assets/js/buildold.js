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
  } else {
    alert("Please fill in all required fields.");
  }
}

// Tambahkan fungsi untuk memuat ulang data dari database saat halaman dimuat
function loadLinktreeData() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  fetch(`/api/linktree/${id}`)
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

// In buildold.js - Modify saveChanges function to include design data
let currentDesignData = null;

// Listen for design data updates
window.addEventListener("designDataUpdate", (event) => {
  currentDesignData = event.detail;
});

// Update the saveChanges function
async function saveChanges() {
  const urlParams = new URLSearchParams(window.location.search);
  const idLinktree = urlParams.get("id");

  if (!idLinktree) {
    alert("ID Linktree tidak ditemukan di URL!");
    return;
  }

  // Get the current design data
  const designData = collectDesignData();

  // Prepare data for sending
  const jsonData = {
    title: designData?.title || "",
    bio: designData?.bio || "",
    style: {
      ...designData?.style,
      // Ensure profile image and background image are in base64 format
      profileImage: designData?.style?.profileImage || null,
      background: designData?.style?.background || {},
    },
    btnArray: links,
  };

  try {
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
    const response = await fetch(`/api/linktree/${id}`);
    if (!response.ok) {
      throw new Error("Gagal memuat data Linktree");
    }

    const data = await response.json();
    console.log("Button Data:", data.buttonData); // Debugging

    // Render tombol berdasarkan data buttonData
    renderButtons(data.buttonData);
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
