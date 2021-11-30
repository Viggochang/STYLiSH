// eslint-disable-next-line import/extensions
import { getUrl, cartProductList, myStorage } from './base.js';

const pageTitle = document.querySelector('title');
const productMainImage = document.querySelector('.product-main-image');
const productTitle = document.querySelector('.product-title');
const productId = document.querySelector('.product-id');
const productPrice = document.querySelector('.product-price');
const colorGroup = document.querySelector('.color-group');
const sizeGroup = document.querySelector('.size-group');
const quantityInputEl = document.querySelector('.product-quantity-input');
const quantityBtn = document.querySelectorAll('.quantity-btn');
const quantity = document.querySelector('#quantity');
const addToCart = document.querySelector('#add-to-cart');
const productNote = document.querySelector('.product-note');
const productTexture = document.querySelector('.product-texture');
const productDescription = document.querySelector('.product-description');
const productWash = document.querySelector('.product-wash');
const productPlace = document.querySelector('.product-place');
const productStory = document.querySelector('.product-story');
const moreImg = document.querySelector('.more-img');

let originVariant = '';
let allVariantsStock = [];
let colorStock = {};
let sizeStock = {};
let quantityMax = 0;

const idFromUrl = new URLSearchParams(window.location.search).get('id');
const productDetailUrl = getUrl(['products', 'details'], { id: idFromUrl });

function renewAllVariantsStock() {
  const cartThisProductList = cartProductList.filter(
    (cartProduct) => cartProduct.id === Number(idFromUrl),
  );
  allVariantsStock = JSON.parse(originVariant).map((item) => {
    const variantStock = item;
    cartThisProductList.forEach((cartProduct) => {
      if (
        variantStock.color_code === cartProduct.color.code
        && variantStock.size === cartProduct.size
      ) {
        variantStock.stock -= cartProduct.qty;
      }
    });
    return variantStock;
  });
}

function renewColorStock() {
  colorStock = allVariantsStock.reduce((acc, cur) => {
    const { color_code: colorCode } = cur;
    if (!acc[colorCode]) {
      acc[colorCode] = 0;
    }
    acc[colorCode] += cur.stock;
    return acc;
  }, {});
}

function renewSizeStock() {
  const colorSelectEl = document.querySelector('.color-select');
  if (colorSelectEl) {
    const colorSelect = colorSelectEl.dataset.color;
    sizeStock = allVariantsStock
      .filter((variant) => variant.color_code === colorSelect)
      .reduce((acc, cur) => {
        const { size } = cur;
        acc[size] = cur.stock;
        return acc;
      }, {});
  } else {
    Object.keys(sizeStock).forEach((key) => {
      sizeStock[key] = 0;
    });
  }
}

function renewQuantityMax() {
  const sizeSelectEl = document.querySelector('.size-select');
  if (sizeSelectEl) {
    const sizeSelect = sizeSelectEl.dataset.size;
    quantityMax = sizeStock[sizeSelect];
  } else {
    quantityMax = 0;
    quantityInputEl.classList.add('quantity-disable');
    addToCart.classList.add('addToCart-disable');
    document.querySelector('.addToCart-disable').innerText = '此商品已售完';
  }
}

function getDataForCart(id, title, price) {
  const colorSelectEl = document.querySelector('.color-select');
  const sizeSelectEl = document.querySelector('.size-select');
  const quentitySelect = document.querySelector('#quantity');

  const name = title;
  const color = {
    name: colorSelectEl.dataset.colorName,
    code: colorSelectEl.dataset.color,
  };
  const { size } = sizeSelectEl.dataset;
  const qty = Number(quentitySelect.innerText);
  const stock = quantityMax;
  return {
    id,
    name,
    price,
    color,
    size,
    qty,
    stock,
  };
}

function setDisableVariant(variant, variantStock) {
  const curVariantDisableEls = document.querySelectorAll(`.${variant}-disable`);
  if (curVariantDisableEls) {
    curVariantDisableEls.forEach((disableEl) => disableEl.classList.remove(`${variant}-disable`));
  }
  Object.keys(variantStock)
    .filter((key) => !variantStock[key])
    .forEach((key) => {
      const DisableEl = document.querySelector(`[data-${variant}~=${key}]`);
      DisableEl.classList.add(`${variant}-disable`);
    });
}

function setDefaultVariant(variant) {
  const SelectEl = document.querySelector(`.${variant}-select`);
  const selectIsDisable = SelectEl ? SelectEl.classList.contains(`${variant}-disable`) : false;
  if (selectIsDisable || !SelectEl) {
    if (selectIsDisable) {
      SelectEl.classList.remove(`${variant}-select`);
    }
    const productVariantEls = document.querySelectorAll(`.product-${variant}`);
    for (let i = 0; i < productVariantEls.length; i += 1) {
      const variantEl = productVariantEls[i];
      const isDisable = variantEl.classList.contains(`${variant}-disable`);
      if (!isDisable) {
        variantEl.classList.add(`${variant}-select`);
        return 0;
      }
    }
  }
  return 0;
}

function handlerSelectVariant(e, variant) {
  const targetEl = e.currentTarget;
  const clickDisable = targetEl.classList.contains(`${variant}-disable`);
  if (!clickDisable) {
    if (!targetEl.classList.contains(`${variant}-select`)) {
      quantity.innerText = 1;
      const preSelectEl = document.querySelector(`.${variant}-select`);
      preSelectEl.classList.remove(`${variant}-select`);
      targetEl.classList.add(`${variant}-select`);
    }
    if (variant === 'color') {
      renewSizeStock();
      setDisableVariant('size', sizeStock);
      setDefaultVariant('size');
    }
    renewQuantityMax();
  }
}

function handlerQuantity(e) {
  const quantityNum = Number(quantity.innerText);
  const btnEl = e.currentTarget;
  if (btnEl.classList.contains('decrement') && quantityNum > 1) {
    quantity.innerText = quantityNum - 1;
  } else if (btnEl.classList.contains('increment') && quantityNum < quantityMax) {
    quantity.innerText = quantityNum + 1;
  }
}

function setColorVariant(colors) {
  colors.forEach((color) => {
    const { code, name } = color;
    const productColor = document.createElement('div');
    productColor.className = 'product-color';
    if (!colorStock[code]) {
      productColor.classList.add('color-disable');
    }
    productColor.style = `background-color: #${code};`;
    productColor.dataset.color = code;
    productColor.dataset.colorName = name;
    productColor.addEventListener('click', (e) => handlerSelectVariant(e, 'color'));
    colorGroup.appendChild(productColor);
  });
  setDefaultVariant('color');
  renewSizeStock();
}

function setSizeVariant(sizes) {
  sizes.forEach((size) => {
    const productSize = document.createElement('div');
    productSize.className = 'product-size';
    if (!sizeStock[size]) {
      productSize.classList.add('size-disable');
    }
    productSize.innerText = size;
    productSize.dataset.size = size;
    productSize.addEventListener('click', (e) => handlerSelectVariant(e, 'size'));
    sizeGroup.appendChild(productSize);
  });
  setDefaultVariant('size');
  renewQuantityMax();
}

function setQuantity() {
  quantityBtn.forEach((btn) => {
    btn.addEventListener('click', handlerQuantity);
  });
}

function setCartLocalStorage(productDataForCart) {
  for (let i = 0; i < cartProductList.length; i += 1) {
    const cartProduct = cartProductList[i];
    const sameProduct = cartProduct.id === productDataForCart.id;
    const sameColor = cartProduct.color.code === productDataForCart.color.code;
    const sameSize = cartProduct.size === productDataForCart.size;
    if (sameProduct && sameColor && sameSize) {
      cartProduct.qty += productDataForCart.qty;
      myStorage.setItem('list', JSON.stringify(cartProductList));
      return 0;
    }
  }

  cartProductList.push(productDataForCart);
  myStorage.setItem('list', JSON.stringify(cartProductList));
  return 0;
}

function handlerCart(id, title, price) {
  const clickDisable = addToCart.classList.contains('addToCart-disable');
  if (!clickDisable) {
    const cartCountEl = document.querySelectorAll('.count');
    const productDataForCart = getDataForCart(id, title, price);
    setCartLocalStorage(productDataForCart);
    cartCountEl.forEach((el) => {
      const cart = el;
      cart.innerText = cartProductList.length;
    });
    renewAllVariantsStock();

    renewColorStock();
    setDisableVariant('color', colorStock);
    setDefaultVariant('color');

    renewSizeStock();
    setDisableVariant('size', sizeStock);
    setDefaultVariant('size');

    renewQuantityMax();
    alert('已加入購物車');
    quantity.innerText = 1;
  }
}

function renderProductDetail(res) {
  const productDetailDate = res.data;
  const {
    id,
    title,
    description,
    price,
    texture,
    wash,
    place,
    note,
    story,
    main_image: mainImage,
    images,
    variants,
    colors,
    sizes,
  } = productDetailDate;
  originVariant = JSON.stringify(variants);
  renewAllVariantsStock();
  renewColorStock();

  pageTitle.innerText = `${title} | STYLiSH`;
  productMainImage.src = mainImage;
  productMainImage.alt = `${title}-商品照片`;
  productTitle.innerText = title;
  productId.innerText = id;
  productPrice.innerText = `TWD.${price}`;
  productNote.innerText = note;
  productTexture.innerText = texture;
  productDescription.innerHTML = description.replace(/\r\n/g, '<br/>');
  productWash.innerText = `清洗：${wash}`;
  productPlace.innerText = `產地：${place}`;
  productStory.innerText = story;
  images.forEach((img) => {
    const productImg = document.createElement('img');
    productImg.className = 'product-image';
    productImg.src = img;
    productImg.alt = `${title}-更多商品照片`;
    moreImg.appendChild(productImg);
  });

  setColorVariant(colors);
  setSizeVariant(sizes);

  setQuantity();
  addToCart.addEventListener('click', () => handlerCart(id, title, price));
}

fetch(productDetailUrl)
  .then((res) => res.json())
  .then((res) => renderProductDetail(res));
