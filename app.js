(() => {
  const { restaurant, categories } = window.menuData;
  const nav = document.querySelector("#category-nav");
  const menuContent = document.querySelector("#menu-content");
  const searchInput = document.querySelector("#menu-search");
  const emptyState = document.querySelector("#empty-state");
  // Keep both filters in state so search and category selection can be combined.
  let selectedCategory = "all";
  let searchQuery = "";

  document.querySelector("#restaurant-logo").textContent = restaurant.logo;
  document.querySelector("#restaurant-name").textContent = restaurant.name;
  document.querySelector("#footer-name").textContent = restaurant.name;
  document.title = `${restaurant.name} | Menu`;

  function makeCategoryButton(id, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-pill shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors";
    button.dataset.category = id;
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedCategory = id;
      render();
    });
    return button;
  }

  function renderCategories() {
    nav.replaceChildren(makeCategoryButton("all", "All"));
    categories.forEach((category) => {
      nav.append(makeCategoryButton(category.id, category.name));
    });
    updateCategoryButtons();
  }

  function updateCategoryButtons() {
    nav.querySelectorAll("button").forEach((button) => {
      const isSelected = button.dataset.category === selectedCategory;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function makeItemCard(item) {
    const article = document.createElement("article");
    article.className = `menu-card flex gap-3.5 py-4${item.isAvailable ? "" : " unavailable"}`;

    const image = document.createElement("img");
    image.className = "menu-image h-[92px] w-[92px] shrink-0 rounded-md bg-[#e7e6de] sm:h-[108px] sm:w-[108px]";
    image.src = item.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.onerror = () => { image.hidden = true; };

    const details = document.createElement("div");
    details.className = "flex min-w-0 flex-1 flex-col justify-between py-0.5";

    const heading = document.createElement("div");
    const titleRow = document.createElement("div");
    titleRow.className = "flex flex-wrap items-center gap-x-2 gap-y-1";
    const name = document.createElement("h4");
    name.className = "text-[15px] font-semibold leading-snug";
    // Use textContent for menu copy so data is never interpreted as HTML.
    name.textContent = item.name;

    const dietary = document.createElement("span");
    dietary.className = "inline-flex items-center gap-1.5 text-[10px] font-medium text-[#64675f]";
    const dot = document.createElement("span");
    const dietaryClass = item.dietaryTag.toLowerCase().replace(" ", "-");
    dot.className = `dietary-dot dietary-${dietaryClass}`;
    dot.setAttribute("aria-hidden", "true");
    dietary.append(dot, document.createTextNode(item.dietaryTag));
    titleRow.append(name, dietary);

    const description = document.createElement("p");
    description.className = "mt-1.5 line-clamp-2 text-xs leading-[1.55] text-[color:var(--muted)]";
    description.textContent = item.description;
    heading.append(titleRow, description);

    const footer = document.createElement("div");
    footer.className = "mt-2 flex items-center justify-between gap-2";
    const price = document.createElement("span");
    price.className = "text-sm font-semibold";
    price.textContent = `$${item.price.toFixed(2)}`;
    footer.append(price);

    if (!item.isAvailable) {
      const badge = document.createElement("span");
      badge.className = "rounded-sm bg-[#ecebe5] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#686b63]";
      badge.textContent = "Out of stock";
      footer.append(badge);
      article.setAttribute("aria-label", `${item.name}, out of stock`);
    }

    details.append(heading, footer);
    article.append(image, details);
    return article;
  }

  function render() {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    // Filter categories and their items before rebuilding the visible menu.
    const visibleCategories = categories
      .filter((category) => selectedCategory === "all" || category.id === selectedCategory)
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const searchableText = `${item.name} ${item.description} ${item.dietaryTag}`.toLocaleLowerCase();
          return searchableText.includes(normalizedQuery);
        })
      }))
      .filter((category) => category.items.length > 0);

    menuContent.replaceChildren();
    visibleCategories.forEach((category) => {
      const section = document.createElement("section");
      section.className = "mb-5";
      section.setAttribute("aria-labelledby", `heading-${category.id}`);
      const heading = document.createElement("h3");
      heading.id = `heading-${category.id}`;
      heading.className = "serif border-b border-[color:var(--line)] pb-2 text-[21px]";
      heading.textContent = category.name;
      section.append(heading);
      category.items.forEach((item) => section.append(makeItemCard(item)));
      menuContent.append(section);
    });

    emptyState.classList.toggle("hidden", visibleCategories.length > 0);
    updateCategoryButtons();
  }

  searchInput.addEventListener("input", (event) => {
    searchQuery = event.currentTarget.value;
    render();
  });

  renderCategories();
  render();
})();