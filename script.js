document.addEventListener("DOMContentLoaded", () => {

    // =============================
    // MENU MOVIL
    // =============================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    mobileMenuBtn?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // =============================
    // CARRITO
    // =============================
    let cart = [];

    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const floatingCartBadge = document.getElementById('floating-cart-badge');

    // =============================
    // MODAL CARRITO
    // =============================
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const sendOrderBtn = document.getElementById("send-order-btn");

    floatingCartBtn?.addEventListener("click", () => {
        renderCartModal();
        cartOverlay.classList.add("active");
    });

    closeCartBtn?.addEventListener("click", () => {
        cartOverlay.classList.remove("active");
    });

    cartOverlay?.addEventListener("click", (e) => {
        if (e.target === cartOverlay) {
            cartOverlay.classList.remove("active");
        }
    });

    // =============================
    // MODAL VARIANTES
    // =============================
    function openVariantModal({ title, options, onSelect }) {

        const modal = document.getElementById("variant-modal");
        const titleEl = document.getElementById("variant-title");
        const container = document.getElementById("variant-options");

        titleEl.innerText = title;
        container.innerHTML = "";

        options.forEach(opt => {

            const btn = document.createElement("button");
            btn.className = "variant-option";

            btn.innerHTML = `
                <div style="font-size:1.1rem;font-weight:600;">
                    ${opt.label}
                </div>

                <div>
                    $${opt.price}
                </div>
            `;

            btn.onclick = () => {
                onSelect(opt);
                closeVariantModal();
            };

            container.appendChild(btn);
        });

        modal.classList.add("active");
    }

    function closeVariantModal() {
        document
            .getElementById("variant-modal")
            .classList.remove("active");
    }

    document
        .getElementById("variant-cancel")
        ?.addEventListener("click", closeVariantModal);

    // =============================
    // AGREGAR AL CARRITO
    // =============================
    function addToCart(name, price) {

        const existing = cart.find(p => p.name === name);

        if (existing) {
            existing.qty++;
        } else {
            cart.push({
                name,
                price,
                qty: 1
            });
        }

        updateBadges();
        bounceCart();
    }

    // =============================
    // MANEJAR PRODUCTO
    // =============================
    function handleProduct(product) {

    // SOLO abrir modal si hay MÁS de 1 variante
    if (product.variants && product.variants.length > 1) {

        openVariantModal({
            title: product.name,
            options: product.variants,
            onSelect: (opt) => {

                addToCart(
                    `${product.name} (${opt.label})`,
                    opt.price
                );

            }
        });

        return;
    }

    // SI SOLO HAY 1 VARIANTE
    if (product.variants && product.variants.length === 1) {

        const only = product.variants[0];

        addToCart(
            `${product.name} (${only.label})`,
            only.price
        );

        return;
    }

    // PRODUCTO NORMAL
    addToCart(product.name, product.price);
}

    // =============================
    // RENDER MENU
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

                if (item.variants && item.variants.length > 0) {

                    priceText = item.variants
                        .map(v => `$${v.price}`)
                        .join("/");

                } else {

                    priceText = `$${item.price}`;

                }

                itemDiv.innerHTML = `
                    <span class="menu-item-name">
                        ${item.name}
                    </span>

                    <span class="menu-item-price">
                        ${priceText}
                    </span>

                    <button class="add-btn">
                        +
                    </button>
                `;

                itemDiv
                    .querySelector(".add-btn")
                    .addEventListener("click", () => {
                        handleProduct(item);
                    });

                catDiv.appendChild(itemDiv);

            });

            container.appendChild(catDiv);

        });
    }

    // =============================
    // RENDER CARRITO
    // =============================
    function renderCartModal() {

        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {

            cartItemsContainer.innerHTML =
                "Tu carrito está vacío";

            cartTotalPrice.innerText = "$0";

            return;
        }

        let total = 0;

        cart.forEach((item, index) => {

            const itemTotal = item.qty * item.price;

            total += itemTotal;

            const div = document.createElement("div");

            div.className = "cart-item";

            div.innerHTML = `
                <div>

                    <strong>${item.name}</strong>

                    <div class="cart-controls">

                        <button
                            class="qty-btn"
                            data-index="${index}"
                            data-action="dec"
                        >
                            -
                        </button>

                        <span>${item.qty}</span>

                        <button
                            class="qty-btn"
                            data-index="${index}"
                            data-action="inc"
                        >
                            +
                        </button>

                    </div>

                </div>

                <div>
                    $${itemTotal}
                </div>
            `;

            cartItemsContainer.appendChild(div);

        });

        cartTotalPrice.innerText = `$${total}`;

        // botones + -
        document.querySelectorAll(".qty-btn").forEach(btn => {

            btn.addEventListener("click", () => {

                const i = btn.dataset.index;
                const action = btn.dataset.action;

                if (action === "inc") {

                    cart[i].qty++;

                } else {

                    cart[i].qty--;

                    if (cart[i].qty <= 0) {
                        cart.splice(i, 1);
                    }
                }

                updateBadges();
                renderCartModal();

            });

        });

    }

    // =============================
    // GOOGLE SHEETS
    // =============================
    async function loadMenu() {

        try {

            const res = await fetch(
                "https://opensheet.elk.sh/1vLqcqnzorzWeUAWrc51NvdKLPsg1K-d2SsTVdwvQu-g/menu"
            );

            const rows = await res.json();

            const categories = {};

            rows.forEach(r => {

                const categoria = (r.Categoria || "").trim();
                const producto = (r.Productos || "").trim();
                const tamaño = (r.Tamaño || "").trim();
                const precio = parseFloat(r.Precio);

                if (!categoria || !producto) return;

                if (!categories[categoria]) {

                    categories[categoria] = {
                        category: categoria,
                        items: []
                    };

                }

                let existingItem =
                    categories[categoria].items.find(
                        i => i.name === producto
                    );

                // crear producto
                if (!existingItem) {

                    existingItem = {
                        name: producto
                    };

                    categories[categoria]
                        .items
                        .push(existingItem);

                }

                // variantes
                if (tamaño) {

                    if (!existingItem.variants) {
                        existingItem.variants = [];
                    }

                    existingItem.variants.push({
                        label: tamaño,
                        price: precio
                    });

                } else {

                    existingItem.price = precio;

                }

            });

            renderMenu(Object.values(categories));

        } catch (err) {

            console.error(err);

        }

    }

    // =============================
    // BADGE
    // =============================
    function updateBadges() {

        const total = cart.reduce(
            (acc, item) => acc + item.qty,
            0
        );

        if (floatingCartBadge) {
            floatingCartBadge.innerText = total;
        }

    }

    // =============================
    // ANIMACION CARRITO
    // =============================
    function bounceCart() {

        if (!floatingCartBtn) return;

        floatingCartBtn.style.transform = "scale(1.15)";

        setTimeout(() => {
            floatingCartBtn.style.transform = "scale(1)";
        }, 200);

    }

    // =============================
    // WHATSAPP
    // =============================
    sendOrderBtn?.addEventListener("click", () => {

        if (cart.length === 0) {

            alert("Tu carrito está vacío");

            return;
        }

        let text = "Hola, quiero pedir:%0A%0A";

        let total = 0;

        cart.forEach(item => {

            const subtotal = item.qty * item.price;

            total += subtotal;

            text += `${item.qty}x ${item.name} - $${subtotal}%0A`;

        });

        text += `%0A💰 Total: $${total}`;

        window.open(
            `https://wa.me/528621203922?text=${text}`,
            "_blank"
        );

    });

    // =============================
    // INICIAR
    // =============================
    loadMenu();

});
