document.addEventListener("DOMContentLoaded", () => {

    // =============================
    // 🔹 MENU MOVIL
    // =============================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        loadMenu();
    }

    // =============================
    // 🔹 CARRITO
    // =============================

    // let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cart = [];

    // ELEMENTOS
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');

    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');

    const cartBadge = document.getElementById('cart-badge');
    const floatingCartBadge = document.getElementById('floating-cart-badge');

    const sendOrderBtn = document.getElementById('send-order-btn');

    // =============================
    // 🔹 MODAL
    // =============================
    const toggleCart = () => cartOverlay.classList.toggle('active');

    openCartBtn?.addEventListener('click', toggleCart);
    floatingCartBtn?.addEventListener('click', toggleCart);
    closeCartBtn?.addEventListener('click', toggleCart);

    cartOverlay?.addEventListener('click', (e) => {
        if (e.target === cartOverlay) toggleCart();
    });

    // =============================
    // 🔹 AGREGAR PRODUCTOS
    // =============================
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {

            const btn = e.target;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);

            const existing = cart.find(p => p.name === name);

            if (existing) {
                existing.qty++;
            } else {
                cart.push({ name, price, qty: 1 });
            }

            updateCartUI();
            bounceCart();
        }
    });

    // =============================
    // 🔹 ACTUALIZAR UI
    // =============================
    function updateCartUI() {

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p style="text-align:center;">Tu carrito está vacío</p>`;
            updateBadges(0);
            cartTotalPrice.innerText = "$0";
            return;
        }

        cart.forEach((item, index) => {

            total += item.price * item.qty;
            totalItems += item.qty;

            const el = document.createElement('div');
            el.className = "cart-item";

            el.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" data-action="minus" data-i="${index}">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" data-action="plus" data-i="${index}">+</button>
                    </div>
                </div>
                <div class="cart-item-price">$${item.price * item.qty}</div>
            `;

            cartItemsContainer.appendChild(el);
        });

        // BOTON LIMPIAR
        const clearBtn = document.createElement('button');
        clearBtn.className = "btn";
        clearBtn.textContent = "Vaciar carrito";
        clearBtn.style.marginTop = "10px";

        clearBtn.addEventListener('click', () => {
            cart = [];
            updateCartUI();
        });

        cartItemsContainer.appendChild(clearBtn);

        updateBadges(totalItems);
        cartTotalPrice.innerText = `$${total}`;
    }

    // =============================
    // 🔹 EVENTOS + Y -
    // =============================
    document.addEventListener('click', (e) => {

        if (e.target.dataset.action === "plus") {
            cart[e.target.dataset.i].qty++;
        }

        if (e.target.dataset.action === "minus") {
            const i = e.target.dataset.i;
            cart[i].qty--;

            if (cart[i].qty <= 0) {
                cart.splice(i, 1);
            }
        }

        updateCartUI();
    });

    // =============================
    // 🔹 BADGES
    // =============================
    function updateBadges(count) {
        cartBadge.innerText = count;
        floatingCartBadge.innerText = count;
    }

    // =============================
    // 🔹 ANIMACION
    // =============================
    function bounceCart() {
        [openCartBtn, floatingCartBtn].forEach(btn => {
            if (!btn) return;
            btn.style.transform = "scale(1.2)";
            setTimeout(() => btn.style.transform = "scale(1)", 200);
        });
    }

    // =============================
    // 🔹 WHATSAPP
    // =============================
    sendOrderBtn?.addEventListener('click', () => {

        if (cart.length === 0) {
            alert("Tu carrito está vacío");
            return;
        }

        let text = "Hola, quiero pedir:\n\n";
        let total = 0;

        cart.forEach(p => {
            text += `${p.qty}x ${p.name} = $${p.qty * p.price}\n`;
            total += p.qty * p.price;
        });

        text += `\nTotal: $${total}`;

        const url = `https://wa.me/528781147915?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    });

    // =============================
    // 🔹 INIT
    // =============================
    updateCartUI();
});

// =============================
// 🔹 CARGAR MENU JSON
// =============================
async function loadMenu() {
    try {
        const res = await fetch("menu.json");
        const data = await res.json();

        renderMenu(data.menu);
    } catch (err) {
        console.error("Error cargando menú:", err);
    }
}

// =============================
// 🔹 RENDERIZAR MENU
// =============================
function renderMenu(menu) {

    const container = document.getElementById("menu-container");
    container.innerHTML = "";

    menu.forEach(category => {

        const catDiv = document.createElement("div");
        catDiv.className = "menu-category";

        const title = document.createElement("h3");
        title.innerText = category.category;

        catDiv.appendChild(title);

        category.items.forEach(item => {

            const itemDiv = document.createElement("div");
            itemDiv.className = "menu-item";

            let priceText = "";

            if (item.variants) {
                priceText = `$${item.variants[0].price}/$${item.variants[1].price}`;
            } else {
                priceText = `$${item.price}`;
            }

            itemDiv.innerHTML = `
                <span class="menu-item-name">${item.name}</span>
                <span class="menu-item-price">${priceText}</span>
                <button class="add-btn">+</button>
            `;

            const btn = itemDiv.querySelector(".add-btn");

            btn.addEventListener("click", () => {
                handleProduct(item);
            });

            catDiv.appendChild(itemDiv);
        });

        container.appendChild(catDiv);
    });
}

// =============================
// 🔹 MANEJAR PRODUCTO
// =============================
function handleProduct(product) {

    if (product.variants) {
        openVariantModal({
            title: product.name,
            options: product.variants,
            onSelect: (opt) => {
                addToCart(`${product.name} (${opt.label})`, opt.price);
            }
        });
        return;
    }

    addToCart(product.name, product.price);
}

// =============================
// 🔹 AGREGAR AL CARRITO (REUTILIZABLE)
// =============================
function addToCart(name, price) {

    const existing = cart.find(p => p.name === name);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }

    updateCartUI();
    bounceCart();
}
