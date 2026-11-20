const filterInput = document.getElementById("filterInput");
const sortSelect = document.getElementById("sortSelect");
const productsBody = document.getElementById("productsBody");

let originalProducts = [];

async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    originalProducts = data.products.slice(0, 30);
    renderTable();
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
  }
}

function renderTable() {
  let filteredProducts = [...originalProducts];

  const query = filterInput.value.toLowerCase().trim();
  if (query) {
    filteredProducts = filteredProducts.filter((product) => {
      const titleMatch = product.title.toLowerCase().includes(query);
      const descMatch = product.description.toLowerCase().includes(query);
      return titleMatch || descMatch;
    });
  }

  const sortMode = sortSelect.value;
  if (sortMode === "asc") {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortMode === "desc") {
    filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
  }

  productsBody.innerHTML = "";

  filteredProducts.forEach((product) => {
    const row = document.createElement("tr");

    const tdImg = document.createElement("td");
    const img = document.createElement("img");
    img.src = product.thumbnail;
    img.alt = product.title;
    tdImg.appendChild(img);

    const tdTitle = document.createElement("td");
    tdTitle.textContent = product.title;

    const tdDesc = document.createElement("td");
    tdDesc.textContent = product.description;

    row.appendChild(tdImg);
    row.appendChild(tdTitle);
    row.appendChild(tdDesc);

    productsBody.appendChild(row);
  });
}

filterInput.addEventListener("input", renderTable);
sortSelect.addEventListener("change", renderTable);

fetchProducts();
