// eslint-disable-next-line import/extensions
import { getUrl } from './base.js';

const container = document.querySelector('.container');
const productType = ['all', 'women', 'men', 'accessories'];
const tag = new URLSearchParams(window.location.search).get('tag') || 'all';
let productPage = 0;

function setNavColor(tagSelect) {
  if (productType.includes(tagSelect) && tagSelect !== 'all') {
    document.querySelector(`.nav-${tagSelect}`).style = 'color:var(--sepia);';
  }
}

function createProductElement(productsData) {
  const productsDataLength = productsData.length;
  if (productsDataLength) {
    for (let i = 0; i < productsDataLength; i += 1) {
      const {
        main_image: mainImage, colors, title, price, id,
      } = productsData[i];

      const newProduct = document.createElement('a');
      const productImg = document.createElement('img');
      const productColors = document.createElement('div');
      const productName = document.createElement('div');
      const productPrice = document.createElement('div');

      newProduct.className = 'product';
      productImg.className = 'product-img';
      productColors.className = 'colors';
      productName.className = 'product-name';
      productPrice.className = 'product-price';

      newProduct.href = `./product.html?id=${id}`;
      productImg.src = mainImage;
      productImg.alt = title;
      colors.forEach((element) => {
        const { code } = element;
        const color = document.createElement('div');
        color.className = 'color';
        color.style = `background-color: #${code}`;
        productColors.appendChild(color);
      });
      productName.innerText = title;
      productPrice.innerText = `TWD.${price}`;

      container.appendChild(newProduct);
      newProduct.appendChild(productImg);
      newProduct.appendChild(productColors);
      newProduct.appendChild(productName);
      newProduct.appendChild(productPrice);
    }
  } else {
    const noResult = document.createElement('h2');
    noResult.className = 'no-result';
    noResult.appendChild(document.createTextNode('搜尋不到產品喔'));
    container.appendChild(noResult);
    container.style = 'justify-content: center';
  }

  function addNoProduct() {
    const countProduct = document.getElementsByClassName('product').length;
    const columnNumber = 3;
    if (countProduct % columnNumber === columnNumber - 1) {
      const newProduct = document.createElement('div');
      newProduct.className = 'product no-product';
      container.appendChild(newProduct);
    }
  }
  addNoProduct();
}

function renderProducts(res) {
  const { data } = res;
  createProductElement(data);
  productPage = res.next_paging;
}

const productsUrl = productType.includes(tag)
  ? getUrl(['products', tag])
  : getUrl(['products', 'search'], { keyword: tag });
fetch(productsUrl)
  .then((res) => res.json())
  .then((res) => renderProducts(res));

function renderMoreProduct(nextPage) {
  productsUrl.searchParams.set('paging', nextPage);
  fetch(productsUrl)
    .then((res) => res.json())
    .then((res) => renderProducts(res));
}

function handlerInfiniteScroll() {
  const bottomToWindowTop = document.body.getBoundingClientRect().bottom;
  const windowHeight = window.innerHeight;
  const buffer = 100;

  if (bottomToWindowTop - windowHeight < buffer) {
    if (!productPage) {
      return 0;
    }
    const nextPage = productPage;
    productPage = undefined;
    renderMoreProduct(nextPage);
  }
  return 0;
}

function createInfiniteScroll() {
  window.addEventListener('scroll', handlerInfiniteScroll);
}

setNavColor(tag);

createInfiniteScroll();
