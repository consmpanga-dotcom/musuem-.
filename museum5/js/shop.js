// Open item modal
function openModal(img) {
  const modal = document.getElementById("itemModal");
  const item = img.closest(".souvenir-item");

  document.getElementById("modalImage").src = img.src;
  document.getElementById("modalTitle").textContent = item.querySelector("h3").innerText;
  document.getElementById("modalDescription").textContent = item.querySelectorAll("p")[0].innerText;
  document.getElementById("modalPrice").textContent = item.querySelectorAll("p")[1].innerText;

  const id = item.dataset.id;
  const name = item.querySelector("h3").innerText;
  const price = parseFloat(item.querySelectorAll("p")[1].innerText.replace(/[^\d.]/g, ""));
  const image = img.src;

  const modalAddButton = document.getElementById("modalAddButton");
  modalAddButton.onclick = () => addToCart({ id, name, price, image });

  modal.style.display = "flex";
}

// Close modal
function closeModal() {
  document.getElementById("itemModal").style.display = "none";
}

// Add item to localStorage cart
function addToCart(item) {
  let cart = JSON.parse(localStorage.getItem("museumCart")) || [];

  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    item.quantity = 1;
    cart.push(item);
  }

  localStorage.setItem("museumCart", JSON.stringify(cart));
  alert(`${item.name} added to your cart!`);
}

// Close modal when clicking outside it
window.onclick = function (event) {
  const modal = document.getElementById("itemModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};