(function () {
  "use strict";

  const SELLERS = window.SELLERS;
  const bySlug = Object.fromEntries(SELLERS.map((s) => [s.slug, s]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const main = document.getElementById("main");
  const topbar = document.querySelector(".topbar");
  const cartLink = document.querySelector(".cart-link");
  const cartCount = document.querySelector(".cart-count");
  const toastEl = document.querySelector(".toast");

  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const priceValue = (s) => parseFloat(s.price.replace(/[^\d.]/g, "")) || 0;
  const fmt = (n) => "₿ " + n.toFixed(2);

  // ---------- storage (best effort: private mode or file previews may block it) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* memory only */ }
    },
  };

  // ---------- cart ----------
  let cart = store.get("didw-cart", []).filter((slug) => bySlug[slug]);
  let lastOrder = store.get("didw-order", null);

  function saveCart() {
    store.set("didw-cart", cart);
    const n = cart.length;
    cartCount.textContent = n;
    cartCount.toggleAttribute("data-zero", n === 0);
    cartLink.setAttribute("aria-label", `Cart, ${n} item${n === 1 ? "" : "s"}`);
  }
  function addToCart(slug) {
    if (!cart.includes(slug)) cart.push(slug);
    saveCart();
    cartLink.classList.remove("bump");
    void cartLink.offsetWidth;
    cartLink.classList.add("bump");
    toast(`${bySlug[slug].item} added to cart.`);
  }
  function removeFromCart(slug) {
    cart = cart.filter((s) => s !== slug);
    saveCart();
  }

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  // ---------- views ----------
  const SIGIL = `<svg class="portal-sigil" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.5"><path d="M50 8 92 86H8Z"/><path d="M50 30 74 74H26Z" opacity=".55"/></g><circle cx="50" cy="60" r="7" fill="currentColor"/></svg>`;

  function viewPortal() {
    return `
      <section class="portal view">
        ${SIGIL}
        <h1><span class="line glitch" data-text="DI DARKWEB">DI DARKWEB</span><span class="line glitch" data-text="INTEL">INTEL</span></h1>
        <p class="portal-tag">Not everything in DI is above ground.<span class="cursor" aria-hidden="true"></span></p>
        <a class="btn btn-enter" href="#/market" data-enter>Enter the dark web</a>
      </section>`;
  }

  function viewMarket() {
    const cards = SELLERS.map((s) => `
      <li>
        <a class="card" href="#/seller/${s.slug}" style="--accent:${s.accent}">
          <div class="card-img"><img src="${s.portrait}" alt="${esc(s.name)}, stylized seller portrait" decoding="async" width="720" height="720"></div>
          <div class="card-body">
            <p class="card-item">${esc(s.item)}</p>
            <p class="card-teaser">${esc(s.teaser)}</p>
            <p class="card-price">${esc(s.price)}</p>
          </div>
        </a>
      </li>`).join("");
    return `
      <section class="wrap view">
        <p class="eyebrow">// underground exchange · 9 verified sellers</p>
        <h1 class="page-title" tabindex="-1">The Marketplace</h1>
        <p class="page-sub">Pick a familiar face. Everything is for sale. Nothing is real.</p>
        <ul class="roster">${cards}</ul>
      </section>`;
  }

  function viewSeller(s) {
    const i = SELLERS.indexOf(s);
    const prev = SELLERS[(i + SELLERS.length - 1) % SELLERS.length];
    const next = SELLERS[(i + 1) % SELLERS.length];
    const inCart = cart.includes(s.slug);
    const hero = s.images[0];
    const thumbs = s.images.length > 1
      ? `<ul class="thumbs" aria-label="Product photos">${s.images.map((img, n) => `
          <li><button class="thumb" type="button" data-open="${n}" aria-label="View larger: ${esc(img.caption)}">
            <img src="${img.src}" alt="" decoding="async"></button></li>`).join("")}</ul>`
      : "";
    const description = s.description.map((p) => `<p>${esc(p)}</p>`).join("");
    const powers = s.powers
      ? `<h2 class="section-h">The five powers</h2><dl class="powers">${s.powers.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>`
      : "";
    const bonus = s.bonus ? `<h2 class="section-h">Bonus collectible</h2><p>${esc(s.bonus)}</p>` : "";
    const maker = s.maker ? `<p class="note">${esc(s.maker)}</p>` : "";
    const warning = s.warning ? `<p class="note"><strong>Warning:</strong> ${esc(s.warning)}</p>` : "";

    return `
      <section class="wrap view">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/market">← All sellers</a><span aria-hidden="true">/</span><span>${esc(s.name)}</span></nav>
        <div class="listing" style="--accent:${s.accent}">
          <div class="gallery">
            <button class="hero-btn" type="button" data-open="0" aria-label="View larger: ${esc(hero.caption)}">
              <img src="${hero.src}" alt="${esc(hero.alt)}" decoding="async">
              <span class="zoom-hint" aria-hidden="true">Tap to enlarge</span>
            </button>
            ${thumbs}
          </div>
          <div class="details">
            <h1 class="listing-title" tabindex="-1">${s.itemHtml || esc(s.item)}</h1>
            <p class="listing-teaser">${esc(s.teaser)}</p>
            <div class="price-row"><span class="price">${esc(s.price)}</span><span class="price-note">${esc(s.priceNote)}</span></div>
            <div class="actions">
              <button class="btn" type="button" data-add="${s.slug}" ${inCart ? "disabled aria-disabled=\"true\"" : ""}>${inCart ? "In your cart" : "Add to cart"}</button>
              ${inCart ? `<a class="btn btn-ghost" href="#/cart">View cart</a>` : ""}
            </div>
            <div class="prose">
              ${description}
              ${powers}
              <h2 class="section-h">What’s included</h2>
              <ul class="included">${s.included.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
              ${bonus}
              ${maker}
              ${warning}
            </div>
            <div class="seller-panel">
              <img src="${s.portrait}" alt="${esc(s.name)}, seller portrait" decoding="async">
              <div>
                <p class="seller-label">Seller</p>
                <p class="seller-name">${esc(s.name.toUpperCase())}</p>
                <p class="seller-meta">Verified underground vendor · ships never</p>
              </div>
            </div>
            <nav class="seller-nav" aria-label="Other sellers">
              <a href="#/seller/${prev.slug}">← ${esc(prev.name)}</a>
              <a href="#/seller/${next.slug}">${esc(next.name)} →</a>
            </nav>
          </div>
        </div>
      </section>`;
  }

  function viewCart() {
    const items = cart.map((slug) => bySlug[slug]);
    const total = items.reduce((sum, s) => sum + priceValue(s), 0);
    if (!items.length) {
      return `
        <section class="wrap view">
          <p class="eyebrow">// cart</p>
          <h1 class="page-title" tabindex="-1">Your stash</h1>
          <div class="empty" style="margin-top:24px">
            <p>Your cart is empty. Suspiciously law-abiding.</p>
            <a class="btn" href="#/market">Browse sellers</a>
          </div>
        </section>`;
    }
    const rows = items.map((s) => `
      <li class="cart-row" style="--accent:${s.accent}">
        <img src="${s.images[0].src}" alt="" decoding="async">
        <div>
          <p class="cart-row-title"><a href="#/seller/${s.slug}">${esc(s.item)}</a></p>
          <p class="cart-row-price">${esc(s.price)} · sold by ${esc(s.name)}</p>
        </div>
        <button class="icon-btn" type="button" data-remove="${s.slug}" aria-label="Remove ${esc(s.item)}">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </li>`).join("");
    return `
      <section class="wrap view">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/market">← Keep shopping</a></nav>
        <p class="eyebrow">// cart</p>
        <h1 class="page-title" tabindex="-1">Your stash</h1>
        <div class="cart-grid">
          <div>
            <ul class="cart-list">${rows}</ul>
            <div class="cart-total"><span>Total (imaginary)</span><span>${fmt(total)}</span></div>
          </div>
          <div class="checkout">
            <h2>Payment method</h2>
            <p class="pay-option"><span class="radio" aria-hidden="true"></span>The only accepted method:</p>
            <div class="bod-card" role="img" aria-label="A brushed-metal Bank of Dad card, held by the Next Generation, with an unlimited limit">
              <div class="bod-bank">BANK OF DAD</div>
              <div class="bod-tag">Allowance division</div>
              <div class="bod-chip"></div>
              <div class="bod-number">•••• •••• •••• 1031</div>
              <div class="bod-holder">The next generation</div>
              <div class="bod-limit">Limit: “ask your mother”</div>
            </div>
            <button class="btn" type="button" data-checkout style="width:100%">Authorize imaginary purchase</button>
            <p class="disclaimer">Parody checkout. No card details are collected, no money moves, and the Bank of Dad does not exist.</p>
          </div>
        </div>
      </section>`;
  }

  function viewReceipt() {
    if (!lastOrder) return viewCart();
    const lines = lastOrder.items.map((slug) => bySlug[slug]).filter(Boolean);
    return `
      <section class="wrap view">
        <div class="receipt">
          <p class="stamp"><small>Bank of Dad</small>APPROVED</p>
          <h1 class="page-title" tabindex="-1">Transaction complete</h1>
          <p>Order ${esc(lastOrder.id)} · Dad has been notified. He sighed, then said “fine.”</p>
          <ul class="receipt-lines">${lines.map((s) => `<li><span>${esc(s.item)}</span><span>${esc(s.price)}</span></li>`).join("")}</ul>
          <div class="receipt-total"><span>Total charged</span><span>${fmt(lastOrder.total)}</span></div>
          <p>Delivery: never. Refunds: also never. Your items exist only in the underground of your imagination.</p>
          <a class="btn" href="#/market">Back to the market</a>
        </div>
      </section>`;
  }

  // ---------- router ----------
  let currentSeller = null;
  const scrollMemory = {};

  function parse(hash) {
    const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (!parts.length) return { name: "portal" };
    if (parts[0] === "market") return { name: "market" };
    if (parts[0] === "seller" && bySlug[parts[1]]) return { name: "seller", seller: bySlug[parts[1]] };
    if (parts[0] === "cart") return { name: "cart" };
    if (parts[0] === "receipt") return { name: "receipt" };
    return { name: "market" };
  }

  let lastHash = location.hash;
  function render(focus) {
    const route = parse(location.hash);
    currentSeller = route.seller || null;
    topbar.hidden = route.name === "portal";
    document.title = route.seller ? `${route.seller.name} · DI DARKWEB INTEL` : "DI DARKWEB INTEL";
    main.innerHTML =
      route.name === "portal" ? viewPortal()
      : route.name === "seller" ? viewSeller(route.seller)
      : route.name === "cart" ? viewCart()
      : route.name === "receipt" ? viewReceipt()
      : viewMarket();
    window.scrollTo(0, scrollMemory[location.hash] || 0);
    if (focus) {
      const h = main.querySelector("h1[tabindex]");
      if (h) h.focus({ preventScroll: true });
    }
  }

  window.addEventListener("hashchange", () => {
    scrollMemory[lastHash] = window.scrollY;
    lastHash = location.hash;
    if (lightbox.open) lightbox.close();
    toastEl.classList.remove("show");
    render(true);
  });

  // ---------- clicks ----------
  document.addEventListener("click", (e) => {
    const enter = e.target.closest("[data-enter]");
    if (enter) {
      e.preventDefault();
      if (reduceMotion) { location.hash = "#/market"; return; }
      document.body.classList.add("descending");
      setTimeout(() => {
        document.body.classList.remove("descending");
        document.body.classList.add("arrived");
        location.hash = "#/market";
        setTimeout(() => document.body.classList.remove("arrived"), 700);
      }, 560);
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open && currentSeller) { openLightbox(currentSeller, +open.dataset.open, open); return; }
    const add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add); render(false); main.querySelector("[data-add]")?.focus(); return; }
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      removeFromCart(remove.dataset.remove);
      render(false);
      (main.querySelector("[data-remove]") || main.querySelector("h1[tabindex]"))?.focus();
      return;
    }
    if (e.target.closest("[data-checkout]")) {
      const total = cart.reduce((sum, slug) => sum + priceValue(bySlug[slug]), 0);
      lastOrder = { id: "DAD-" + Math.random().toString(36).slice(2, 8).toUpperCase(), items: cart.slice(), total };
      store.set("didw-order", lastOrder);
      cart = [];
      saveCart();
      location.hash = "#/receipt";
    }
  });

  // ---------- lightbox ----------
  const lightbox = document.querySelector(".lightbox");
  const lbImg = lightbox.querySelector(".lb-img");
  const lbCaption = lightbox.querySelector(".lb-caption");
  const lbCount = lightbox.querySelector(".lb-count");
  let lbImages = [];
  let lbIndex = 0;
  let lbReturnFocus = null;

  function showImage(n, animate) {
    lbIndex = (n + lbImages.length) % lbImages.length;
    const img = lbImages[lbIndex];
    const apply = () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = img.caption;
      lbCount.textContent = lbImages.length > 1 ? `${lbIndex + 1} of ${lbImages.length}` : "";
      lbImg.classList.remove("swap");
    };
    if (animate && !reduceMotion) { lbImg.classList.add("swap"); setTimeout(apply, 180); } else apply();
  }

  function openLightbox(seller, n, trigger) {
    lbImages = seller.images;
    lbReturnFocus = trigger;
    lightbox.style.setProperty("--accent", seller.accent);
    lightbox.classList.toggle("single", lbImages.length < 2);
    showImage(n, false);
    lightbox.showModal();
    document.body.classList.add("locked");
    lightbox.querySelector(lbImages.length > 1 ? ".lb-next" : ".lb-close").focus();
  }

  lightbox.addEventListener("close", () => {
    document.body.classList.remove("locked");
    if (lbReturnFocus && document.contains(lbReturnFocus)) lbReturnFocus.focus();
  });
  lightbox.querySelector(".lb-close").addEventListener("click", () => lightbox.close());
  lightbox.querySelector(".lb-prev").addEventListener("click", () => showImage(lbIndex - 1, true));
  lightbox.querySelector(".lb-next").addEventListener("click", () => showImage(lbIndex + 1, true));
  // Backdrop close: a click on the dark area around the image (not on the image or controls).
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lb-stage")) lightbox.close();
  });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); showImage(lbIndex - 1, true); }
    if (e.key === "ArrowRight") { e.preventDefault(); showImage(lbIndex + 1, true); }
  });

  let touchX = null;
  let touchY = null;
  lightbox.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) { touchX = null; return; }
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null || lbImages.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showImage(lbIndex + (dx < 0 ? 1 : -1), true);
    touchX = null;
  }, { passive: true });

  saveCart();
  render(false);
})();
