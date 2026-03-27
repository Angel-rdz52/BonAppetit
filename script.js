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
    // CARGAR MENU GOOGLE SHEETS
    // =============================
    async function loadMenu() {
        try {

            const res = await fetch(
                "https://opensheet.elk.sh/1vLqcqnzorzWeUAWrc51NvdKLPsg1K-d2SsTVdwvQu-g/menu"
            );

            const rows = await res.json();

            const data = { menu: [] };

            rows.forEach(r => {

                if (!r.Categoria) return;

                let cat = data.menu.find(
                    c => c.category === r.Categoria
                );

                if (!cat) {
                    cat = {
                        category: r.Categoria,
                        items: []
                    };
                    data.menu.push(cat);
                }

                let item = cat.items.find(
                    i => i.name === r.Productos
                );

                if (!item) {
                    item = { name: r.Productos };
                    cat.items.push(item);
                }

                if (r.Tamaño) {

                    if (!item.variants)
                        item.variants = [];

                    item.variants.push({
                        label: r.Tamaño,
                        price: parseFloat(r.Precio)
                    });

                } else {

                    item.price = parseFloat(r.Precio);

                }

            });

            renderMenu(data.menu);

        } catch (err) {
            console.error("Error cargando menú:", err);
        }
    }

    // =============================
    // BADGE
    // =============================
    function updateBadges() {
        const total = cart.reduce((a, b) => a + b.qty, 0);
        if (floatingCartBadge)
            floatingCartBadge.innerText = total;
    }

    function bounceCart() {

        if (!floatingCartBtn) return;

        floatingCartBtn.style.transform = "scale(1.2)";

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

    loadMenu();

});
