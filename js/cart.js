function loadCart() {
  const container = document.getElementById("cartContainer");
  let cart = JSON.parse(localStorage.getItem("museumCart")) || [];

  if (cart.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>Your cart is empty.</p>";
    return;
  }

  let total = 0;
  let html = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#eee;">
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Subtotal</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
  `;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    html += `
      <tr>
        <td>
          <img src="${item.image}" alt="${item.name}" style="width:50px; vertical-align:middle; margin-right:10px;">
          ${item.name}
        </td>
        <td>$${item.price.toFixed(2)}</td>
        <td>
          <input type="number" min="1" value="${item.quantity}" 
            onchange="updateQuantity('${item.id}', this.value)" 
            style="width:50px; text-align:center;">
        </td>
        <td>$${subtotal.toFixed(2)}</td>
        <td><button onclick="removeItem('${item.id}')">Remove</button></td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <h3 style="text-align:right;">Total: $${total.toFixed(2)}</h3>
  `;

  container.innerHTML = html;
}

// Update item quantity
function updateQuantity(id, newQty) {
  let cart = JSON.parse(localStorage.getItem("museumCart")) || [];
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity = parseInt(newQty);
    localStorage.setItem("museumCart", JSON.stringify(cart));
    loadCart();
  }
}

// Remove item from cart
function removeItem(id) {
  let cart = JSON.parse(localStorage.getItem("museumCart")) || [];
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem("museumCart", JSON.stringify(cart));
  loadCart();
}

// Clear all items
function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    localStorage.removeItem("museumCart");
    loadCart();
  }
}
