let currentQRCode = {
  data: null,
  style: {
    color: "#000000",
    logo: null,
  }
};

// Function to switch between tabs
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Handle form submission
document
  .getElementById("qrForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    try {
      const response = await fetch("/qr/generateQR", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        currentQRCode.data = data;
        displayQRResult(data);
        document.getElementById("inputSection").style.display = "none";
        document.getElementById("resultSection").style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });

  function displayQRResult(data) {
    document.getElementById("qrTitle").textContent = "Title: " + data.title;
    document.getElementById("qrUrl").textContent = "URL: " + data.url;
  
    const img = document.createElement("img");
    img.src = data.imageData; // Set QR code image source
    img.alt = data.title;
  
    const container = document.getElementById("qrCodeContainer");
    container.innerHTML = ""; // Clear previous content
    container.appendChild(img);
  
    // Set logo in currentQRCode.style.logo
    if (data.logo) {
      currentQRCode.style.logo = data.logo; // Set the logo Data URI
    }
  }
  

async function updateQRStyle(color = null, element = null, logoInput = null) {
  const formData = new FormData();
  formData.append("url", currentQRCode.data.url);
  formData.append("title", currentQRCode.data.title);

  if (color) {
    currentQRCode.style.color = color;
    document
      .querySelectorAll(".color-option")
      .forEach((opt) => opt.classList.remove("selected"));
    if (element) element.classList.add("selected");
  }
  formData.append("color", currentQRCode.style.color);

  if (logoInput && logoInput.files[0]) {
    currentQRCode.style.logo = logoInput.files[0];
  }
  if (currentQRCode.style.logo) {
    formData.append("logo", currentQRCode.style.logo);
  }

  try {
    const response = await fetch("/qr/generateQR", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      currentQRCode.data = data;
      displayQRResult(data);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to update QR code style.");
  }
}

function copyQRCode() {
  if (currentQRCode.data) {
    fetch(currentQRCode.data.imageData)
      .then((res) => res.blob())
      .then((blob) => {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard
          .write([item])
          .then(() => alert("QR Code copied to clipboard!"))
          .catch(() => alert("Failed to copy QR Code"));
      });
  }
}

function downloadQRCode() {
  if (currentQRCode.data) {
    const a = document.createElement("a");
    a.href = currentQRCode.data.imageData;
    a.download = `qr-code-${currentQRCode.data.title}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

async function saveQRCode() {
  if (currentQRCode.data) {
    
    const payload = {
      imageData: currentQRCode.style.logo,
      date: new Date().toISOString(),
      color: currentQRCode.style.color,
      url: currentQRCode.data.url,
      title: currentQRCode.data.title
    };
    
    try {
      const response = await fetch('/qr/saveqr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("QR berhasil disimpan ke database");
        document.getElementById("qrForm").reset();
        document.getElementById("inputSection").style.display = "block";
        document.getElementById("resultSection").style.display = "none";
      } else {
        alert("Gagal menyimpan QR code");
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert("Terjadi kesalahan saat menyimpan QR code");
    }
  }
}

async function displayQRCode1() {
  try {
    const response = await fetch('/qr/pick', {
      method: 'GET'
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('QR code retrieved successfully');
      
      const qrImage = document.createElement('img');
      qrImage.src = data.imageData;
      
      const container = document.getElementById('qrDisplayContainer');
      container.innerHTML = '';
      container.appendChild(qrImage);
    } else {
      console.error('Failed to retrieve QR code:', data.error);
    }
  } catch (error) {
    console.error('Error fetching QR code:', error);
  }
}

document.getElementById("defaultOpen").click();

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function loadHistory() {
  try {
    const response = await fetch('/qr/show');
    const data = await response.json();

    if (!data.success) {
      console.error(data.error);
      return;
    }

    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';

    data.qrData.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      
      // Store data as data attributes
      historyItem.dataset.id = item.id; // Tambahkan ID ke dataset
      historyItem.dataset.color = item.style.color || "#000000";
      historyItem.dataset.logo = item.style.imageData || "";

      historyItem.innerHTML = `
        <i data-feather="link"></i>
        <div class="link-details">
          <p class="title">${item.style.title || 'No title available'}</p>
          <p class="url">${item.style.url || 'No URL available'}</p>
          <p><i data-feather="calendar"></i> ${new Date(item.style.date).toLocaleDateString() || 'No date available'}</p>
        </div>
        <div class="actions">
          <button onclick="copyHistoryQR(this)" class="save-btn">
            <i data-feather="copy"></i> Copy
          </button>
          <button onclick="editHistoryQR(this)" class="save-btn">
            <i data-feather="edit"></i> Edit
          </button>
          <button onclick="deleteHistoryQR(this)" class="save-btn">
            <i data-feather="trash-2"></i> Delete
          </button>
        </div>
      `;

      historyContainer.appendChild(historyItem);
    });

    feather.replace();

  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

async function editHistoryQR(button) {
  try {
    // Get the history item element
    const historyItem = button.closest('.history-item');
    const title = historyItem.querySelector(".title").textContent;
    const url = historyItem.querySelector(".url").textContent;
    const color = historyItem.dataset.color;
    const logoDataURI = historyItem.dataset.logo;

    // Switch to Create tab and show result section
    document.getElementById("defaultOpen").click();
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("resultSection").style.display = "block";

    // Update the result section with existing data
    document.getElementById("qrTitle").textContent = "Title: " + title;
    document.getElementById("qrUrl").textContent = "URL: " + url;

    // Create FormData object
    const formData = new FormData();
    formData.append("url", url);
    formData.append("title", title);
    formData.append("color", color || "#000000");

    // Convert base64 logo to File object if it exists
    if (logoDataURI) {
      const logoFile = await base64ToFile(logoDataURI, "logo.png");
      formData.append("logo", logoFile);
    }

    // Generate QR code
    const response = await fetch("/qr/generateQR", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      // Update currentQRCode object
      currentQRCode.data = {
        title: title,
        url: url,
        imageData: data.imageData
      };
      
      currentQRCode.style = {
        color: color || "#000000",
        logo: data.logo || null
      };

      // Display the result
      displayQRResult(data);

      // Update color picker value
      document.getElementById("colorPicker").value = color;
      
      // Update color selection UI
      document.querySelectorAll(".color-option").forEach(opt => {
        opt.classList.remove("selected");
        if (opt.style.backgroundColor === color) {
          opt.classList.add("selected");
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load QR code for editing.");
  }
}

// Helper function to convert base64 to File object
async function base64ToFile(dataURI, fileName) {
  // Get the base64 content after the comma
  const base64Content = dataURI.split(',')[1];
  // Convert base64 to blob
  const byteString = atob(base64Content);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: 'image/png' });
  return new File([blob], fileName, { type: 'image/png' });
}

async function copyHistoryQR(button) {
  try {
    const historyItem = button.closest(".history-item");
    
    // Get the stored QR data
    const title = historyItem.querySelector(".title").textContent;
    const url = historyItem.querySelector(".url").textContent;
    const color = historyItem.dataset.color;
    const logoDataURI = historyItem.dataset.logo;

    // Create FormData object to regenerate QR with styles
    const formData = new FormData();
    formData.append("url", url);
    formData.append("title", title);
    formData.append("color", color || "#000000");

    // Convert base64 logo to File if it exists
    if (logoDataURI) {
      // Get the base64 content after the comma
      const base64Content = logoDataURI.split(',')[1];
      // Convert base64 to blob
      const byteString = atob(base64Content);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: 'image/png' });
      const logoFile = new File([blob], "logo.png", { type: 'image/png' });
      formData.append("logo", logoFile);
    }

    // Generate QR code with current styles
    const response = await fetch("/qr/generateQR", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      // Convert the Data URI to a Blob
      const response = await fetch(data.imageData);
      const blob = await response.blob();
      
      // Create a ClipboardItem with the blob
      const item = new ClipboardItem({ "image/png": blob });
      
      // Write to clipboard
      await navigator.clipboard.write([item]);
      alert("QR Code copied to clipboard!");
    } else {
      throw new Error('Failed to generate QR code');
    }
  } catch (error) {
    console.error('Error copying QR code:', error);
    alert("Failed to copy QR code to clipboard. Please try again.");
  }
}

async function deleteHistoryQR(button) {
  try {
    const historyItem = button.closest(".history-item");
    const id = historyItem.dataset.id;

    if (!confirm("Are you sure you want to delete this QR code?")) {
      return;
    }

    const response = await fetch(`/qr/delete/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    historyItem.remove();

  } catch (error) {
    console.error('Error deleting QR code:', error);
    alert('Failed to delete QR code. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', loadHistory);