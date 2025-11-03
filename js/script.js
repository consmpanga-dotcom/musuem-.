// Existing Collection display function
function showCollection(type) {
  const contentBox = document.getElementById("collection-content");
  let content = "";

  if (type === "archaeology") {
    content = `
      <h3>Archaeology Collection</h3>
      <p>Explore ancient artifacts, pottery, and relics from past civilizations.
      Each piece tells a story of human innovation and survival.</p>
      <img src="../images/file_jpg.png" alt="Archaeological artifacts" style="width:300px; height:auto;" onclick="openModal('inkstone')" title="Click to interpret">
    `;
  } else if (type === "anthropology") {
    content = `
      <h3>Anthropology Collection</h3>
      <p>Dive into the study of cultures, languages, and traditions.
      Learn how societies evolved through time and space.</p>
      <img src="../images/file_jpg3.png" alt="Anthropology exhibit" style="width:300px; height:auto;" onclick="openModal('glyphstone')" title="Click to interpret">
    `;
  } else if (type === "history") {
    content = `
      <h3>History Collection</h3>
      <p>Discover documents, maps, and objects that trace key historical events
      shaping our modern world.</p>
      <img src="../images/file_jpg2.png" alt="Historical artifacts" style="width:300px; height:auto;" onclick="openModal('inkstone')" title="Click to interpret">
    `;
  }

  contentBox.innerHTML = content;
}

// --- Cart system code below ---

const CART_KEY = 'museumCartV1';
const TAX_RATE = 0.102;
const MEMBER_DISCOUNT_RATE = 0.15;
const SHIPPING_RATE = 25.00;
const VOLUME_DISCOUNT_TIERS = [
  { min: 0, max: 49.99, rate: 0 },
  { min: 50, max: 99.99, rate: 0.05 },
  { min: 100, max: 199.99, rate: 0.10 },
  { min: 200, max: Infinity, rate: 0.15 }
];

// Cart variables and elements
let cart = [];
let memberDiscountApplied = false;

// Only declare these if present on page (e.g. cart page)
const cartOutput = document.getElementById('cartOutput');
const clearCartBtn = document.getElementById('clearCartBtn');
const memberCheckbox = document.getElementById('memberDiscount');

// Safely add event listeners only if elements exist
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    writeCart(cart);
    render();
  });
}

if (memberCheckbox) {
  memberCheckbox.addEventListener('change', () => {
    memberDiscountApplied = memberCheckbox.checked;
    render();
  });
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const unitPrice = Number(btn.dataset.price);
  const image = btn.dataset.image;

  let cart = readCart();
  const idx = cart.findIndex(item => item.id === id);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id, name, unitPrice, qty: 1, image });
  }
  writeCart(cart);

  // Update qty badge on the item card (if on shop page)
  const card = btn.closest('.souvenir-item');
  if (card) {
    const badge = card.querySelector('.qty-badge');
    if (badge) {
      const item = cart.find(it => it.id === id);
      badge.textContent = item ? `Qty: ${item.qty}` : '';
    }
  }
}

function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  writeCart(cart);
  render();
}

function formatCurrency(amount) {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toFixed(2);
  return amount < 0 ? `(${formatted})` : formatted;
}

function getVolumeDiscountRate(subtotal) {
  for (let tier of VOLUME_DISCOUNT_TIERS) {
    if (subtotal >= tier.min && subtotal <= tier.max) {
      return tier.rate;
    }
  }
  return 0;
}

function render() {
  if (!cartOutput) return; // Prevent running if no cartOutput on page

  cart = readCart();

  // Remove items with 0 qty or 0 price
  cart = cart.filter(item => item.unitPrice > 0 && item.qty > 0);
  writeCart(cart);

  if (cart.length === 0) {
    cartOutput.innerHTML = `<p>Your cart is empty.</p>`;
    clearCartBtn.disabled = true;
    memberCheckbox.checked = false;
    memberDiscountApplied = false;
    return;
  }

  clearCartBtn.disabled = false;

  // Calculate item total
  let itemTotal = 0;
  cart.forEach(item => {
    itemTotal += item.unitPrice * item.qty;
  });

  // Discounts
  const volumeDiscountRate = getVolumeDiscountRate(itemTotal);
  const volumeDiscountAmount = itemTotal * volumeDiscountRate;
  const memberDiscountAmount = itemTotal * MEMBER_DISCOUNT_RATE;

  let discountType = null;
  let discountAmount = 0;

  if (memberDiscountApplied && volumeDiscountRate > 0) {
    const choice = confirm(`Both volume discount (${(volumeDiscountRate * 100).toFixed(0)}%) and member discount (15%) apply. Click OK to apply Member Discount, Cancel to apply Volume Discount.`);
    if (choice) {
      discountType = 'Member Discount';
      discountAmount = memberDiscountAmount;
      memberDiscountApplied = true;
      memberCheckbox.checked = true;
    } else {
      discountType = 'Volume Discount';
      discountAmount = volumeDiscountAmount;
      memberDiscountApplied = false;
      memberCheckbox.checked = false;
    }
  } else if (memberDiscountApplied) {
    discountType = 'Member Discount';
    discountAmount = memberDiscountAmount;
  } else if (volumeDiscountRate > 0) {
    discountType = 'Volume Discount';
    discountAmount = volumeDiscountAmount;
  } else {
    discountType = 'No Discount';
    discountAmount = 0;
  }

  // Subtotal = items - discount + shipping
  const subtotal = itemTotal - discountAmount + SHIPPING_RATE;

  // Tax and total
  const taxAmount = subtotal * TAX_RATE;
  const invoiceTotal = subtotal + taxAmount;

  let html = `
  <table class="cart-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Line Total</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
  `;

  cart.forEach(item => {
    const lineTotal = item.unitPrice * item.qty;
    html += `
      <tr>
        <td>
          <img src="${item.image}" alt="${item.name}" style="width:50px; vertical-align:middle; margin-right:8px;" />
          ${item.name}
        </td>
        <td>${item.qty}</td>
        <td style="text-align:right;">$${formatCurrency(item.unitPrice)}</td>
        <td style="text-align:right;">$${formatCurrency(lineTotal)}</td>
        <td><button aria-label="Remove ${item.name}" onclick="removeItem('${item.id}')">Remove</button></td>
      </tr>
    `;
  });

  html += `
    </tbody>
  </table>
  `;

  html += `
  <div class="cart-summary" style="margin-top: 1em;">
    <table>
      <tbody>
        <tr><td>Subtotal of ItemTotals:</td><td style="text-align:right;">$${formatCurrency(itemTotal)}</td></tr>
        <tr><td>Volume Discount (${(volumeDiscountRate * 100).toFixed(0)}%):</td><td style="text-align:right;">$${formatCurrency(-volumeDiscountAmount)}</td></tr>
        <tr><td>Member Discount (${MEMBER_DISCOUNT_RATE * 100}%):</td><td style="text-align:right;">$${formatCurrency(memberDiscountApplied ? -memberDiscountAmount : 0)}</td></tr>
        <tr><td>Shipping:</td><td style="text-align:right;">$${formatCurrency(SHIPPING_RATE)}</td></tr>
        <tr><td><strong>Subtotal (Taxable amount):</strong></td><td style="text-align:right;"><strong>$${formatCurrency(subtotal)}</strong></td></tr>
        <tr><td>Tax Rate %:</td><td style="text-align:right;">${(TAX_RATE * 100).toFixed(1)}%</td></tr>
        <tr><td>Tax Amount:</td><td style="text-align:right;">$${formatCurrency(taxAmount)}</td></tr>
        <tr><td><strong>Invoice Total:</strong></td><td style="text-align:right;"><strong>$${formatCurrency(invoiceTotal)}</strong></td></tr>
      </tbody>
    </table>
  </div>
  `;

  cartOutput.innerHTML = html;
}

// Initial render if on cart page
document.addEventListener('DOMContentLoaded', () => {
  if (cartOutput) {
    render();
  }
});