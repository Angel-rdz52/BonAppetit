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
        if (e.target === cartOverlay)
            cartOverlay.classList.remove("active");
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
                <div style="font-size:1.2rem">${opt.label}</div>
                <div>$${opt.price}</div>
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
            cart.push({ name, price, qty: 1 });
        }

        updateBadges();
        bounceCart();
    }

    // =============================
    // MANEJAR PRODUCTO
    // =============================
    function handleProduct(product) {

        if (product.variants) {
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

        addToCart(product.name, product.price);
    }

    // =============================
    // RENDERIZAR MENU
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
                    priceText =
                        `$${item.variants[0].price}/$${item.variants[1].price}`;
                } else {
                    priceText = `$${item.price}`;
                }

                itemDiv.innerHTML = `
                    <span class="menu-item-name">${item.name}</span>
                    <span class="menu-item-price">${priceText}</span>
                    <button class="add-btn">+</button>
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
    // CARGAR MENU JSON
    // =============================
    async function loadMenu() {
        try {
            const res = await fetch("./menu.json?v=" + Date.now());
            const data = await res.json();
            renderMenu(data.menu);
        } catch (err) {
            console.error("Error cargando menú:", err);
        }
    }

    // =============================
    // RENDER MODAL CARRITO
    // =============================
    function renderCartModal() {

        if (cart.length === 0) {
            cartItemsContainer.innerHTML =
                "<p>Tu carrito está vacío</p>";
            cartTotalPrice.innerText = "$0";
            return;
        }

        let html = "";
        let total = 0;

        cart.forEach((p, i) => {

            total += p.price * p.qty;

            html += `
            <div class="cart-item">
                
                <div>
                    <div>${p.name}</div>
                    
                    <div class="cart-controls">
                        <button class="qty-btn" data-minus="${i}">-</button>
                        <span>${p.qty}</span>
                        <button class="qty-btn" data-plus="${i}">+</button>
                    </div>
                </div>

                <div>$${p.price * p.qty}</div>

            </div>
            `;
        });

        html += `
        <button id="clear-cart" class="btn" style="width:100%;margin-top:10px">
            Vaciar carrito
        </button>
        `;

        cartItemsContainer.innerHTML = html;
        cartTotalPrice.innerText = "$" + total;
    }

    // =============================
    // + -
    // =============================
    document.addEventListener("click", (e) => {

        if (e.target.dataset.plus !== undefined) {

            cart[e.target.dataset.plus].qty++;
            renderCartModal();
            updateBadges();
        }

        if (e.target.dataset.minus !== undefined) {

            const i = e.target.dataset.minus;
            cart[i].qty--;

            if (cart[i].qty <= 0)
                cart.splice(i, 1);

            renderCartModal();
            updateBadges();
        }

        if (e.target.id === "clear-cart") {
            cart = [];
            renderCartModal();
            updateBadges();
        }

    });

    // =============================
    // BADGE
    // =============================
    function updateBadges() {
        const total = cart.reduce((a, b) => a + b.qty, 0);

        if (floatingCartBadge)
            floatingCartBadge.innerText = total;
    }

    // =============================
    // ANIMACION
    // =============================
    function bounceCart() {

        if (!floatingCartBtn) return;

        floatingCartBtn.style.transform = "scale(1.2)";

        setTimeout(() => {
            floatingCartBtn.style.transform = "scale(1)";
        }, 200);
    }

    // =============================
    // ENVIAR WHATSAPP
    // =============================
    sendOrderBtn?.addEventListener("click", () => {

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

        window.open(
            `https://wa.me/528621203922?text=${encodeURIComponent(text)}`,
            "_blank"
        );

        cart = [];
        updateBadges();
        cartOverlay.classList.remove("active");
    });

    // INIT
    loadMenu();

});
