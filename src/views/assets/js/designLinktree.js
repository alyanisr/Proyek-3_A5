// // Get DOM elements
// const titleInput = document.getElementById("titleInput");
// const bioInput = document.getElementById("bioInput");
// const previewUsername = document.getElementById("previewUsername");

// // Update display name in preview
// titleInput.addEventListener("input", function () {
//   previewUsername.textContent = this.value || "@username";
// });

// // Update bio in preview
// bioInput.addEventListener("input", function () {
//   let previewBio = document.getElementById("previewBio");
//   if (!previewBio) {
//     previewBio = document.createElement("p");
//     previewBio.id = "previewBio";
//     previewBio.className = "text-white mb-4";
//     previewUsername.parentNode.insertBefore(
//       previewBio,
//       previewUsername.nextSibling
//     );
//   }
//   previewBio.textContent = this.value;
// });

// // Optional: Ensure color persists when dynamically adding content
// function ensurePreviewColorConsistency(color) {
//   // This function can be called after any dynamic content changes
//   const previewUsername = document.getElementById("previewUsername");
//   const previewBio = document.getElementById("previewBio");

//   if (previewUsername) {
//     previewUsername.style.color = color;
//   }

//   if (previewBio) {
//     previewBio.style.color = color;
//   }
// }

// // Image handling
// function showImageOptions() {
//   const modal = new bootstrap.Modal(
//     document.getElementById("imageOptionsModal")
//   );
//   modal.show();
// }

// function uploadImage() {
//   const input = document.createElement("input");
//   input.type = "file";
//   input.accept = "image/*";
//   input.onchange = handleImageUpload;
//   input.click();
// }

// function handleImageUpload(e) {
//   const file = e.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       updateProfileImage(event.target.result);
//       bootstrap.Modal.getInstance(
//         document.getElementById("imageOptionsModal")
//       ).hide();
//     };
//     reader.readAsDataURL(file);
//   }
// }

// function updateProfileImage(imageUrl) {
//   const profileImage = document.getElementById("profileImage");
//   const previewProfileImage = document.getElementById("previewProfileImage");

//   if (profileImage) profileImage.src = imageUrl;
//   if (previewProfileImage) previewProfileImage.src = imageUrl;
// }

// // Font management
// const fonts = [
//   "Inter",
//   "Roboto",
//   "Poppins",
//   "Montserrat",
//   "Playfair Display",
//   "Oswald",
// ];

// // Initialize font options
// function initializeFonts() {
//   const fontContainer = document.querySelector(".font-options");
//   fontContainer.innerHTML = "";

//   fonts.forEach((font) => {
//     const fontOption = document.createElement("div");
//     fontOption.className = "font-option";
//     fontOption.textContent = font;
//     fontOption.style.fontFamily = font;
//     fontOption.onclick = () => changeFont(font);
//     fontContainer.appendChild(fontOption);
//   });
// }

// // Change font for preview content
// function changeFont(fontFamily) {
//   // Remove active class from all font options
//   document.querySelectorAll(".font-option").forEach((option) => {
//     option.classList.remove("active");
//     if (option.textContent === fontFamily) {
//       option.classList.add("active");
//     }
//   });

//   // Apply font to preview content
//   const previewContent = document.getElementById("previewContent");
//   if (previewContent) {
//     previewContent.style.fontFamily = fontFamily;
//   }
// }

// // Change font color
// function changeFontColor(color) {
//   const previewContent = document.getElementById("previewContent");
//   if (previewContent) {
//     // Terapkan warna ke seluruh elemen dalam preview
//     previewContent.style.color = color;

//     // Query semua elemen teks dalam preview
//     const textElements = previewContent.querySelectorAll(
//       "#previewUsername, #previewBio, .text-white"
//     );

//     textElements.forEach((element) => {
//       // Secara eksplisit set warna untuk setiap elemen
//       element.style.color = color;

//       // Tambahkan !important untuk memastikan warna diterapkan
//       element.style.setProperty("color", color, "important");
//     });
//   }
// }

// // Button style management
// function changeButtonStyle(style) {
//   const previewLinks = document.querySelectorAll(".preview-link");
//   const buttons = document.querySelectorAll(".block-shape");

//   // Remove active class from all button style options
//   buttons.forEach((btn) => btn.classList.remove("active"));

//   // Add active class to selected style
//   const selectedButton = document.querySelector(
//     `.block-shape[onclick="changeButtonStyle('${style}')"]`
//   );
//   if (selectedButton) {
//     selectedButton.classList.add("active");
//   }

//   // Apply button style to preview links
//   previewLinks.forEach((link) => applyButtonStyle(link, style));
// }

// // Apply specific button style
// function applyButtonStyle(element, style) {
//   switch (style) {
//     case "rounded":
//       element.style.borderRadius = "25px";
//       break;
//     case "sharp":
//       element.style.borderRadius = "0";
//       break;
//     case "standard":
//     default:
//       element.style.borderRadius = "8px";
//       break;
//   }
// }

// // Change button color
// function changeButtonColor(color) {
//   const previewLinks = document.querySelectorAll(".preview-link");
//   previewLinks.forEach((link) => {
//     link.style.backgroundColor = color;
//   });
// }

// // Theme management
// // Function to apply custom gradient
// function applyCustomGradient() {
//   const color1 = document.getElementById("gradientColor1").value;
//   const color2 = document.getElementById("gradientColor2").value;
//   changeTheme(color1, color2);
// }

// // Function to apply solid color
// function applySolidColor() {
//   const color = document.getElementById("solidColor").value;
//   changeTheme(color, color);
// }

// // Enhanced theme change function
// function changeTheme(color1, color2) {
//   const previewContent = document.getElementById("previewContent");
//   if (previewContent) {
//     previewContent.style.background =
//       color1 === color2
//         ? color1
//         : `linear-gradient(to bottom, ${color1}, ${color2})`;

//     // Update active states
//     document.querySelectorAll(".theme-option").forEach((option) => {
//       const background = option.style.background;
//       const isActive =
//         background.includes(color1) && background.includes(color2);
//       option.classList.toggle("active", isActive);
//     });
//   }
// }

// //background image
// const backgroundImages = [
//   "/assets/img/Gedung-H2.jpg",
//   "/assets/img/gedung-h3.jpg",
//   "/assets/img/masjid-lh.jpg",
//   "/assets/img/sc2.jpg",
//   "/assets/img/sc.jpg",
// ];

// // Fungsi untuk menginisialisasi pilihan background image
// function initializeBackgroundImages() {
//   console.log("Fungsi initializeBackgroundImages dipanggil");

//   const themeSection = document.getElementById("theme");
//   console.log("Elemen theme section:", themeSection);

//   const backgroundContainer = document.createElement("div");
//   backgroundContainer.id = "background-image-options";
//   backgroundContainer.className =
//     "d-flex flex-wrap justify-content-center mb-3";

//   backgroundImages.forEach((imageUrl, index) => {
//     console.log(`Memproses gambar: ${imageUrl}`);

//     const imageOption = document.createElement("div");
//     imageOption.className = "background-image-option m-2 position-relative";
//     imageOption.style.width = "80px";
//     imageOption.style.height = "60px";
//     imageOption.style.overflow = "hidden";
//     imageOption.style.cursor = "pointer";
//     imageOption.style.border = "2px solid transparent";

//     const img = document.createElement("img");
//     img.src = imageUrl;
//     img.style.width = "100%";
//     img.style.height = "100%";
//     img.style.objectFit = "cover";

//     imageOption.appendChild(img);
//     imageOption.onclick = () => changeBackgroundImage(imageUrl);
//     backgroundContainer.appendChild(imageOption);
//   });

//   // Periksa apakah tema section ada
//   if (themeSection) {
//     const backgroundSection = document.createElement("div");
//     backgroundSection.innerHTML = `<h6 class="mb-2">Background Image</h6>`;
//     backgroundSection.appendChild(backgroundContainer);

//     console.log("Mencoba menambahkan background section");
//     themeSection.appendChild(backgroundSection);
//     console.log("Background section ditambahkan");
//   } else {
//     console.error("Elemen theme section tidak ditemukan!");
//   }
// }

// // Fungsi untuk mengubah background image
// function changeBackgroundImage(imageUrl) {
//   const previewContent = document.getElementById("previewContent");
//   if (previewContent) {
//     // Set background image dengan cover dan center
//     previewContent.style.backgroundImage = `url('${imageUrl}')`;
//     previewContent.style.backgroundSize = "cover";
//     previewContent.style.backgroundPosition = "center";

//     // Tambahkan properti untuk responsivitas
//     previewContent.style.backgroundRepeat = "no-repeat";
//     previewContent.style.width = "100%";
//     previewContent.style.height = "100%";
//     previewContent.style.minHeight = "500px"; // Minimal tinggi untuk berbagai layar
//   }

//   // Update status aktif untuk pilihan background image
//   document.querySelectorAll(".background-image-option").forEach((option) => {
//     const img = option.querySelector("img");
//     const isActive = img && img.src.includes(imageUrl);

//     // Tambahkan efek visual untuk gambar yang dipilih
//     option.style.border = isActive
//       ? "2px solid #007bff"
//       : "2px solid transparent";
//   });
// }

// // Tambahkan event listener pada setiap gambar
// document.addEventListener("DOMContentLoaded", () => {
//   const backgroundImageOptions = document.querySelectorAll(
//     ".background-image-option"
//   );

//   backgroundImageOptions.forEach((option) => {
//     const img = option.querySelector("img");

//     option.addEventListener("click", () => {
//       if (img) {
//         changeBackgroundImage(img.src);
//       }
//     });
//   });
// });

// // Initialize everything when the document is ready
// document.addEventListener("DOMContentLoaded", () => {
//   initializeFonts();

//   // Panggil fungsi untuk menginisialisasi background image
//   initializeBackgroundImages();

//   // Jika ingin set default background
//   if (backgroundImages.length > 0) {
//     changeBackgroundImage(backgroundImages[0]);
//   }

//   // Set default font
//   changeFont("Inter");

//   // Set default button style
//   changeButtonStyle("standard");

//   // Set default theme
//   changeTheme("#4158d0", "#c850c0");

//   // Initialize color pickers with default values
//   document.getElementById("gradientColor1").value = "#4158d0";
//   document.getElementById("gradientColor2").value = "#c850c0";
//   document.getElementById("solidColor").value = "#3498db";
// });

// // Function to convert file to base64 directly
// function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       // Convert ArrayBuffer to base64
//       const base64String = btoa(
//         new Uint8Array(reader.result).reduce(
//           (data, byte) => data + String.fromCharCode(byte),
//           ""
//         )
//       );
//       resolve(base64String);
//     };
//     reader.onerror = reject;
//     reader.readAsArrayBuffer(file);
//   });
// }

// // Function to convert URL to base64
// async function urlToBase64(url) {
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         // Remove data URL prefix if present
//         const base64String = reader.result.split(",")[1];
//         resolve(base64String);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   } catch (error) {
//     console.error("Error converting URL to base64:", error);
//     return null;
//   }
// }

// // Updated handleImageUpload for profile image
// async function handleImageUpload(e) {
//   const file = e.target.files[0];
//   if (file) {
//     try {
//       // Convert file directly to base64
//       const base64Image = await fileToBase64(file);

//       // Save base64 image for later use
//       window.currentProfileImageBase64 = base64Image;

//       // Still show preview using URL.createObjectURL
//       const previewUrl = URL.createObjectURL(file);
//       updateProfileImage(previewUrl);

//       sendDesignData();
//       bootstrap.Modal.getInstance(
//         document.getElementById("imageOptionsModal")
//       ).hide();
//     } catch (error) {
//       console.error("Error processing profile image:", error);
//       alert("Error processing image. Please try again.");
//     }
//   }
// }

// // Updated collectDesignData function
// async function collectDesignData() {
//   // Get background type and values
//   const previewContent = document.getElementById("previewContent");
//   let backgroundData = {};

//   // Handle background image
//   if (previewContent.style.backgroundImage) {
//     // Get selected background image URL from the static options
//     const selectedBgUrl = previewContent.style.backgroundImage.replace(
//       /url\(['"](.+)['"]\)/,
//       "$1"
//     );

//     try {
//       // Convert background image to base64
//       const base64BackgroundImage = await urlToBase64(selectedBgUrl);

//       backgroundData = {
//         type: "image",
//         value: base64BackgroundImage,
//       };
//     } catch (error) {
//       console.error("Error converting background image:", error);
//       backgroundData = {
//         type: "image",
//         value: null,
//       };
//     }
//   } else if (previewContent.style.background.includes("gradient")) {
//     backgroundData = {
//       type: "gradient",
//       value: {
//         color1: document.getElementById("gradientColor1").value,
//         color2: document.getElementById("gradientColor2").value,
//       },
//     };
//   } else {
//     backgroundData = {
//       type: "solid",
//       value: document.getElementById("solidColor").value,
//     };
//   }

//   // Collect all design data
//   const designData = {
//     title: titleInput.value,
//     bio: bioInput.value,
//     style: {
//       profileImage: window.currentProfileImageBase64 || null,
//       background: backgroundData,
//       buttonStyle: {
//         shape:
//           document
//             .querySelector(".block-shape.active")
//             ?.getAttribute("data-style") || "standard",
//         color: getComputedStyle(document.querySelector(".preview-link"))
//           .backgroundColor,
//       },
//       font: {
//         family:
//           document.querySelector(".font-option.active")?.textContent || "Inter",
//         color: getComputedStyle(document.getElementById("previewUsername"))
//           .color,
//       },
//     },
//   };

//   return designData;
// }
