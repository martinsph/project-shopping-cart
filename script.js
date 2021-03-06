const cart = document.querySelector('.cart__items');
const nameKey = 'cartItems';
const totalKey = 'totalPrice';
let array = [];

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

const createLoading = () => {
const loadingContainer = document.querySelector('.container');
const loadingMsg = document.createElement('h1');
loadingMsg.className = 'loading';
loadingMsg.innerHTML = 'loading...';
loadingContainer.appendChild(loadingMsg);
};

const removeLoading = () => {
  const loading = document.querySelector('.loading');
  loading.remove();
};

// Funcção para salvar itens no local storage
const saveItem = (item) => {
  if (typeof (item) === 'string') array.push(item);
  localStorage.setItem(nameKey, JSON.stringify(array));
};

const saveTotal = (total) => {
localStorage.setItem(totalKey, JSON.stringify(total));
};

// Função cria total price
const createTotalPrice = (newTotal) => {
  const printTotal = document.querySelector('.total-price');
  printTotal.innerHTML = newTotal;
};

const totalprice = () => {
  const cartItems = document.querySelectorAll('.cart__item');
  const totalPriceArray = [];
  // Ajuda das salas de estudo para achar o preço e separa-lo
  cartItems.forEach((item) => {
    const aux = item.innerText.split(' ');
    const value = aux[aux.length - 1];
    totalPriceArray.push(parseFloat(value.replace('$', '')));
  });
  const total = totalPriceArray.reduce((acc, curr) => acc + curr, 0);
  createTotalPrice(total);
  saveTotal(total);
}; 

// Função para remover item do carrinho
function cartItemClickListener(e) {
  const liText = e.target.innerText;
  e.target.remove();
  // array = array.filter((item) => item !== liText); // alternativa sem correção do texto do produto com espaço extra.
  const indice = array.findIndex((item) => item === liText); // acha o index do primeiro elemento li.
  array = array.filter((item, idx) => idx !== indice); // salva no array global todos os outros valores para remover só o primeiro.
  totalprice();
  saveItem();
}

/* Função não utilizada
function getSkuFromProductItem(item) {
   return item.querySelector('span.item__sku').innerText;
 }
*/

// Função botão esvaziar carrinho
const BtnRemove = () => {
  const btnRmv = document.querySelector('.empty-cart');
  btnRmv.addEventListener('click', () => {
    cart.innerHTML = '';
    localStorage.removeItem(nameKey);
    createTotalPrice(0);
    localStorage.removeItem(totalKey);
  });
};

// Função para criar elementos no carrinho
function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  const liText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.innerText = liText;
  li.addEventListener('click', cartItemClickListener);
  
  return li;
}

// Função para carregar elementos no carrinho
const addCartItemElement = (text) => {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = text;
  li.addEventListener('click', cartItemClickListener);

  return li;
};

// Função que encontra o Id na API
const fetchId = (sku) => {
  fetch(`https://api.mercadolibre.com/items/${sku}`)
    .then((response) => response.json())
    .then((response) => {
      cart.appendChild(createCartItemElement(response));
      totalprice();
      const allCartItems = document.querySelectorAll('.cart__items li');
      saveItem(allCartItems[allCartItems.length - 1].innerText);
    })
    .catch((error) => (error));
};

// Função que cria lista de produtos
function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  
  const button = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  // Para adicionar o evento na criação do botão tive ajuda do Emerson Filho!
  button.addEventListener('click', () => { 
    fetchId(sku);
    // totalprice();
  });
  section.appendChild(button);

  return section;
}

// Função que carrega os itens salvos, no carrinho
const loadItems = () => {
  const cartItem = localStorage.getItem(nameKey);
  const cartItemString = JSON.parse(cartItem);
  if (cartItemString !== null) {
    array = cartItemString;
    cartItemString.forEach((item) => {
      cart.appendChild(addCartItemElement(item));
    });
  }
  const totalPrice = JSON.parse(localStorage.getItem(totalKey));
  createTotalPrice(totalPrice);
};

// Função que encontra a API do ML
const getMLProducts = () => new Promise((resolve, reject) => {
  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
    .then((response) => response.json())
    .then((response) => resolve(response))
    .catch((error) => reject(error));
});

window.onload = function onload() { 
  createLoading();
  getMLProducts()
    .then((response) => {
      removeLoading();
      response.results.forEach(({ id: sku, title: name, thumbnail: image }) => {
        const list = document.querySelector('.items');
        list.appendChild(createProductItemElement({ sku, name, image }));
      });
    })  
    .catch((error) => error);
  
  loadItems();
  BtnRemove();
};
