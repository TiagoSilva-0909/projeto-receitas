const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const recipesGrid = document.getElementById('recipes-grid');
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
const modalTitle = document.getElementById('recipeModalLabel');
const modalBody = document.querySelector('#recipeModal .modal-body');

const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentPage = 1;
const itemsPerPage = 8;
let currentItems = [];

async function fetchRecipes(query = '') {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.meals || [];
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return [];
  }
}

async function fetchCoffee() {
  try {
    const res = await fetch('https://api.sampleapis.com/coffee/hot');
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar cafés:', error);
    return [];
  }
}

async function fetchDesserts() {
  try {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert');
    const data = await res.json();
    return data.meals || [];
  } catch (error) {
    console.error('Erro ao buscar sobremesas:', error);
    return [];
  }
}

async function fetchRecipeDetails(id) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Erro ao buscar detalhes da receita:', error);
    return null;
  }
}

async function loadPage(page) {
  recipesGrid.innerHTML = `<p class="text-center text-secondary fs-5">Carregando...</p>`;

  const modPage = page % 3;

  if (modPage === 1) {
    const query = searchInput.value.trim() || 'Chicken';
    const allRecipes = await fetchRecipes(query);
    currentItems = allRecipes.slice(0, itemsPerPage);
    renderRecipes(currentItems);
  } else if (modPage === 2) {
    const allCoffee = await fetchCoffee();
    currentItems = allCoffee.slice(0, itemsPerPage);
    renderCoffee(currentItems);
  } else {
    const allDesserts = await fetchDesserts();
    currentItems = allDesserts.slice(0, itemsPerPage);
    renderDesserts(currentItems);
  }

  pageInfo.textContent = `Página ${page}`;
  prevPageBtn.disabled = page === 1;

  nextPageBtn.disabled = currentItems.length < itemsPerPage;
}

function renderRecipes(items) {
  recipesGrid.innerHTML = '';
  if (items.length === 0) {
    recipesGrid.innerHTML = `<p class="text-center text-danger fs-5">Nenhuma receita encontrada.</p>`;
    return;
  }
  items.forEach(recipe => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${recipe.strMealThumb}" class="card-img-top" alt="${recipe.strMeal}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="${recipe.strMeal}">${recipe.strMeal}</h5>
          <p class="card-text text-muted mb-2">${recipe.strArea} | ${recipe.strCategory}</p>
          <button class="btn btn-search mt-auto align-self-start" data-id="${recipe.idMeal}">Ver Receita</button>
        </div>
      </div>
    `;
    recipesGrid.appendChild(col);
    col.querySelector('button').addEventListener('click', () => openRecipeModal(recipe));
  });
}

function renderCoffee(items) {
  recipesGrid.innerHTML = '';
  if (items.length === 0) {
    recipesGrid.innerHTML = `<p class="text-center text-danger fs-5">Nenhum café encontrado.</p>`;
    return;
  }
  items.forEach(coffee => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${coffee.image}" class="card-img-top" alt="${coffee.title}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="${coffee.title}">${coffee.title}</h5>
          <p class="card-text text-muted mb-2">${coffee.description.substring(0, 60)}...</p>
          <button class="btn btn-search mt-auto align-self-start">Ver Café</button>
        </div>
      </div>
    `;
    recipesGrid.appendChild(col);
    col.querySelector('button').addEventListener('click', () => openCoffeeModal(coffee));
  });
}

function renderDesserts(items) {
  recipesGrid.innerHTML = '';
  if (items.length === 0) {
    recipesGrid.innerHTML = `<p class="text-center text-danger fs-5">Nenhuma sobremesa encontrada.</p>`;
    return;
  }
  items.forEach(dessert => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${dessert.strMealThumb}" class="card-img-top" alt="${dessert.strMeal}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="${dessert.strMeal}">${dessert.strMeal}</h5>
          <button class="btn btn-search mt-auto align-self-start" data-id="${dessert.idMeal}">Ver Receita</button>
        </div>
      </div>
    `;
    recipesGrid.appendChild(col);
    col.querySelector('button').addEventListener('click', async () => {
      const recipe = await fetchRecipeDetails(dessert.idMeal);
      if (recipe) openRecipeModal(recipe);
    });
  });
}

function openRecipeModal(recipe) {
  modalTitle.textContent = recipe.strMeal;

  let ingredientsList = '';
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredientsList += `<li>${measure ? measure.trim() : ''} ${ingredient.trim()}</li>`;
    }
  }

  modalBody.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="img-fluid mb-3" />
    <h6>Ingredientes:</h6>
    <ul class="ingredients-list">${ingredientsList}</ul>
    <h6>Modo de preparo:</h6>
    <p class="instructions">${recipe.strInstructions}</p>
  `;

  recipeModal.show();
}

function openCoffeeModal(coffee) {
  modalTitle.textContent = coffee.title;

  modalBody.innerHTML = `
    <img src="${coffee.image}" alt="${coffee.title}" class="img-fluid mb-3" />
    <h6>Descrição:</h6>
    <p>${coffee.description}</p>
    <h6>Ingredientes:</h6>
    <ul>${coffee.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
  `;

  recipeModal.show();
}

searchBtn.addEventListener('click', () => {
  currentPage = 1;
  loadPage(currentPage);
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadPage(currentPage);
  }
});

nextPageBtn.addEventListener('click', () => {
  currentPage++;
  loadPage(currentPage);
});

window.onload = () => {
  loadPage(1);
};
async function loadPage(page) {
  recipesGrid.innerHTML = `<p class="text-center text-secondary fs-5">Carregando...</p>`;

  const modPage = (page - 1) % 3;

  if (modPage === 0) {
    const query = searchInput.value.trim() || 'Chicken';
    const allRecipes = await fetchRecipes(query);
    currentItems = allRecipes.slice(0, itemsPerPage);
    renderRecipes(currentItems);
  } else if (modPage === 1) {
    const allCoffee = await fetchCoffee();
    currentItems = allCoffee.slice(0, itemsPerPage);
    renderCoffee(currentItems);
  } else {
    const allDesserts = await fetchDesserts();
    currentItems = allDesserts.slice(0, itemsPerPage);
    renderDesserts(currentItems);
  }

  pageInfo.textContent = `Página ${page}`;
  prevPageBtn.disabled = page === 1;
  nextPageBtn.disabled = currentItems.length < itemsPerPage;
}
