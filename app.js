const products = [
  { id: 1, name: "Easy does it linen shirt", category: "Clothing", price: 220, original: 280, badge: "A little less", rating: "4.9", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=85" },
  { id: 2, name: "Sunday best sneakers", category: "Shoes", price: 360, original: null, badge: "Just landed", rating: "4.8", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85" },
  { id: 3, name: "The everyday crossbody", category: "Accessories", price: 185, original: null, badge: "Bestseller", rating: "4.9", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85" },
  { id: 4, name: "Soft spot knit cardigan", category: "Clothing", price: 295, original: 350, badge: "A little less", rating: "4.7", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=85" },
  { id: 5, name: "Weekend canvas tote", category: "Accessories", price: 110, original: null, badge: "Everyday fave", rating: "4.8", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=85" },
  { id: 6, name: "Go anywhere low tops", category: "Shoes", price: 320, original: 390, badge: "A little less", rating: "4.8", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=85" },
  { id: 7, name: "Made for movement tee", category: "Clothing", price: 145, original: null, badge: "Just landed", rating: "4.6", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85" },
  { id: 8, name: "Little golden hoops", category: "Accessories", price: 95, original: null, badge: "Easy favourite", rating: "4.9", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=85" },
  { id: 9, name: "Everyday black hoodie", category: "Clothing", price: 350, original: null, badge: "Just landed", rating: "4.9", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=85" },
  { id: 10, name: "Black beaded bracelet", category: "Accessories", price: 65, original: null, badge: "Easy favourite", rating: "4.8", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=85" },
  { id: 11, name: "Silver chain necklace", category: "Accessories", price: 120, original: null, badge: "Just landed", rating: "4.8", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85" },
];

const state = { category: "All", query: "", sort: "featured", cart: [], saved: new Set() };
const productGrid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const resultsCount = document.querySelector("#results-count");
const cartCount = document.querySelector("#cart-count");
const mobileCartCount = document.querySelector("#mobile-cart-count");
const toast = document.querySelector("#toast");
let toastTimeout;
let paymentStatusTimer;
const paymentState = { referenceId: null, status: null, phoneNumber: null, amount: null };

const money = (amount) => `GH₵${amount.toFixed(2)}`;

function renderProducts() {
  let visible = products.filter((product) => {
    const categoryMatches = state.category === "All" || state.category === "New in"
      ? state.category === "All" || product.badge === "Just landed"
      : product.category === state.category;
    const queryMatches = `${product.name} ${product.category}`.toLowerCase().includes(state.query.toLowerCase());
    return categoryMatches && queryMatches;
  });
  if (state.sort === "low") visible = [...visible].sort((a, b) => a.price - b.price);
  if (state.sort === "high") visible = [...visible].sort((a, b) => b.price - a.price);

  productGrid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="product-badge ${product.original ? "sale" : ""}">${product.badge}</span>
        <button class="wishlist-button ${state.saved.has(product.id) ? "saved" : ""}" type="button" data-wishlist="${product.id}" aria-label="${state.saved.has(product.id) ? "Remove from" : "Add to"} wishlist">${state.saved.has(product.id) ? "♥" : "♡"}</button>
        <button class="quick-add" type="button" data-add="${product.id}">Add to bag +</button>
      </div>
      <div class="product-meta">
        <span class="product-category">${product.category}</span><span class="product-rating">★ ${product.rating} <span>(24)</span></span>
        <h3>${product.name}</h3>
        <div class="product-prices"><span class="product-price">${money(product.price)}</span>${product.original ? `<span class="product-original">${money(product.original)}</span>` : ""}</div>
      </div>
    </article>
  `).join("");
  resultsCount.textContent = visible.length ? `${visible.length} good finds for you` : "No results";
  productGrid.hidden = !visible.length;
  emptyState.hidden = !!visible.length;
}

function renderDeals() {
  document.querySelector("#deal-strip").innerHTML = products.filter((item) => item.original).slice(0, 4).map((product) => `
    <article class="deal-card">
      <img src="${product.image}" alt="" loading="lazy" />
      <div class="deal-info"><span class="deal-label">A LITTLE LESS</span><h3>${product.name}</h3><span class="deal-price">${money(product.price)} <del>${money(product.original)}</del></span></div>
      <button class="deal-add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">+</button>
    </article>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2400);
}

function addToCart(id) {
  const product = products.find((item) => item.id === Number(id));
  if (!product) return;
  const item = state.cart.find((line) => line.id === product.id);
  if (item) item.quantity += 1;
  else state.cart.push({ ...product, quantity: 1 });
  renderCart();
  showToast(`${product.name} added to your bag`);
}

function renderCart() {
  const count = state.cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = count;
  mobileCartCount.textContent = count;
  document.querySelector("#cart-empty").hidden = count > 0;
  document.querySelector("#cart-summary").hidden = count === 0;
  document.querySelector("#cart-items").innerHTML = state.cart.map((item) => `
    <article class="cart-line">
      <img src="${item.image}" alt="" />
      <div><h3>${item.name}</h3><p>${item.category} · Qty ${item.quantity}</p></div>
      <div class="cart-line-end"><b>${money(item.price * item.quantity)}</b><button class="remove-item" type="button" data-remove="${item.id}">Remove</button></div>
    </article>
  `).join("");
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector("#cart-subtotal").textContent = money(total);
  document.querySelector("#payment-total").textContent = money(total);
}

function setCategory(category) {
  state.category = category;
  document.querySelectorAll(".category-tab").forEach((button) => button.classList.toggle("active", button.dataset.category === category));
  document.querySelectorAll(".filter-chip").forEach((button) => button.classList.toggle("selected", button.dataset.filter === category));
  document.querySelector("#product-title").innerHTML = category === "All" ? "A little bit of everything<span class=\"heading-period\">.</span>" : `${category}<span class="heading-period">.</span>`;
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) addToCart(addButton.dataset.add);
  const wishlist = event.target.closest("[data-wishlist]");
  if (wishlist) {
    const id = Number(wishlist.dataset.wishlist);
    state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
    renderProducts();
    showToast(state.saved.has(id) ? "Saved to your wishlist" : "Removed from your wishlist");
  }
  const remove = event.target.closest("[data-remove]");
  if (remove) {
    state.cart = state.cart.filter((item) => item.id !== Number(remove.dataset.remove));
    renderCart();
  }
});

document.querySelectorAll(".category-tab").forEach((button) => button.addEventListener("click", () => setCategory(button.dataset.category)));
document.querySelectorAll(".category-pill").forEach((button) => button.addEventListener("click", () => setCategory(button.dataset.category)));
document.querySelectorAll(".filter-chip").forEach((button) => button.addEventListener("click", () => setCategory(button.dataset.filter)));
document.querySelector("#shop-collection").addEventListener("click", () => document.querySelector("#products").scrollIntoView({ behavior: "smooth" }));
document.querySelector("#see-deals").addEventListener("click", () => { setCategory("All"); document.querySelector("#products").scrollIntoView({ behavior: "smooth" }); });
document.querySelector("#sort-select").addEventListener("change", (event) => { state.sort = event.target.value; renderProducts(); });
document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = document.querySelector("#search-input").value.trim();
  setCategory("All");
});
document.querySelector("#search-input").addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderProducts();
});
document.querySelector("#clear-search").addEventListener("click", () => {
  state.query = "";
  state.category = "All";
  document.querySelector("#search-input").value = "";
  setCategory("All");
});

const cartBackdrop = document.querySelector("#modal-backdrop");
function openCart() { cartBackdrop.hidden = false; document.body.style.overflow = "hidden"; }
function closeCart() { cartBackdrop.hidden = true; document.body.style.overflow = ""; }
document.querySelector("#cart-button").addEventListener("click", openCart);
document.querySelector(".mobile-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#keep-shopping").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", (event) => { if (event.target === cartBackdrop) closeCart(); });

document.querySelector("#checkout-button").addEventListener("click", () => {
  closeCart();
  if (paymentState.referenceId) {
    showPaymentConfirmation();
  } else {
    document.querySelector("#payment-confirmation").hidden = true;
    document.querySelector("#payment-form").hidden = false;
  }
  document.querySelector("#payment-backdrop").hidden = false;
  document.body.style.overflow = "hidden";
});
const paymentBackdrop = document.querySelector("#payment-backdrop");
function closePayment() { paymentBackdrop.hidden = true; document.body.style.overflow = ""; }
document.querySelector("#close-payment").addEventListener("click", closePayment);
paymentBackdrop.addEventListener("click", (event) => { if (event.target === paymentBackdrop) closePayment(); });
function showPaymentConfirmation() {
  document.querySelector("#payment-form").hidden = true;
  document.querySelector("#payment-confirmation").hidden = false;
  document.querySelector("#confirmation-total").textContent = `GH₵${paymentState.amount}`;
  const pending = paymentState.status === "PENDING";
  document.querySelector("#confirmation-icon").textContent = paymentState.status === "SUCCESSFUL" ? "✓" : paymentState.status === "FAILED" ? "!" : "…";
  document.querySelector("#confirmation-title").textContent = paymentState.status === "SUCCESSFUL"
    ? "Payment confirmed"
    : paymentState.status === "FAILED"
      ? "Payment not completed"
      : "Request sent to your phone";
  document.querySelector("#confirmation-message").textContent = paymentState.status === "SUCCESSFUL"
    ? "Your MTN MoMo payment was confirmed. Thank you for your order!"
    : paymentState.status === "FAILED"
      ? "Your payment was not completed. You can try again."
      : `Approve the payment request on your MTN MoMo phone (${paymentState.phoneNumber}).`;
  document.querySelector("#payment-status").textContent = pending
    ? "Waiting for your approval…"
    : paymentState.status === "SUCCESSFUL" ? "Payment complete." : "You can close this message and try again.";
  document.querySelector("#done-payment").textContent = paymentState.status === "FAILED" ? "Try again" : "Done";
}

async function checkPaymentStatus() {
  if (!paymentState.referenceId || paymentState.status !== "PENDING") return;
  try {
    const response = await fetch(`/api/payments/momo/status?referenceId=${encodeURIComponent(paymentState.referenceId)}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not check your payment status.");
    paymentState.status = result.status;
    showPaymentConfirmation();
    if (result.status === "SUCCESSFUL") {
      state.cart = [];
      renderCart();
    }
    if (result.status === "PENDING") paymentStatusTimer = setTimeout(checkPaymentStatus, 5000);
  } catch (error) {
    document.querySelector("#payment-status").textContent = error.message || "Could not check payment status. Please try again.";
    paymentStatusTimer = setTimeout(checkPaymentStatus, 10000);
  }
}

document.querySelector("#payment-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const numberInput = document.querySelector("#momo-number");
  if (!numberInput.reportValidity()) return;
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  const errorMessage = document.querySelector("#payment-error");
  const number = numberInput.value.replace(/\D/g, "");
  const formatted = `+233 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  errorMessage.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Sending request…";
  try {
    const response = await fetch("/api/payments/momo/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: `+233${number}`,
        items: state.cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not start your payment. Please try again.");
    paymentState.referenceId = result.referenceId;
    paymentState.status = result.status;
    paymentState.phoneNumber = formatted;
    paymentState.amount = result.amount;
    showPaymentConfirmation();
    clearTimeout(paymentStatusTimer);
    paymentStatusTimer = setTimeout(checkPaymentStatus, 5000);
  } catch (error) {
    errorMessage.textContent = error.message || "Could not reach the payment server. Check your connection and try again.";
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Pay with Mobile Money <span>→</span>';
  }
});
document.querySelector("#done-payment").addEventListener("click", () => {
  if (paymentState.status === "FAILED") {
    clearTimeout(paymentStatusTimer);
    paymentState.referenceId = null;
    paymentState.status = null;
    document.querySelector("#payment-confirmation").hidden = true;
    document.querySelector("#payment-form").hidden = false;
    return;
  }
  closePayment();
  if (paymentState.status === "SUCCESSFUL") {
    paymentState.referenceId = null;
    paymentState.status = null;
    showToast("Thanks for shopping with Alvin Apparel!");
  }
});

document.querySelector("#account-button").addEventListener("click", () => showToast("Profile is coming soon."));
document.querySelectorAll(".mobile-nav-item").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".mobile-nav-item").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  if (button.dataset.mobile === "home") window.scrollTo({ top: 0, behavior: "smooth" });
  if (button.dataset.mobile === "categories") document.querySelector(".category-pills").scrollIntoView({ behavior: "smooth" });
  if (button.dataset.mobile === "cart") openCart();
  if (button.dataset.mobile === "profile") showToast("Profile is coming soon.");
}));

document.querySelector("#chat-launcher").addEventListener("click", () => { document.querySelector("#chat-panel").hidden = false; });
document.querySelector("#close-chat").addEventListener("click", () => { document.querySelector("#chat-panel").hidden = true; });
document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#chat-input");
  const message = input.value.trim();
  if (!message) return;
  const bubble = document.createElement("p");
  bubble.className = "chat-bubble mine";
  bubble.textContent = message;
  document.querySelector("#chat-messages").append(bubble);
  input.value = "";
  const reply = document.createElement("p");
  reply.className = "chat-bubble";
  reply.textContent = "Thanks for reaching out! Our style team will be with you soon.";
  setTimeout(() => {
    document.querySelector("#chat-messages").append(reply);
    document.querySelector("#chat-messages").scrollTop = document.querySelector("#chat-messages").scrollHeight;
  }, 450);
});
document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("You're on the list. Look out for good things!");
  event.target.reset();
});

renderDeals();
renderProducts();
renderCart();
