// eslint-disable-next-line import/extensions
import { cartProductList, myStorage } from './base.js';

const cartHeaderTitle = document.querySelector('.cart__title');
const itemsEl = document.querySelector('.items');
let summarySubtotal = 0;
let freight = 0;

function renderNoItem() {
  const noItemText = document.createElement('h4');
  noItemText.innerText = '購物車內無商品';
  noItemText.style = 'text-align: center; margin:10px 0px -10px';
  itemsEl.appendChild(noItemText);
}
cartHeaderTitle.innerText = `購物車(${cartProductList.length})`;
if (!cartProductList.length) {
  renderNoItem();
}

function renewSummarySubtotal() {
  let newSubtotal = 0;
  document.querySelectorAll('.subtotal').forEach((subtotal) => {
    newSubtotal += Number(subtotal.innerText.split('NT.')[1]);
  });
  summarySubtotal = newSubtotal;
}

function renderSummary() {
  freight = summarySubtotal ? 60 : 0;
  const summaryClassName = ['summary__subtotal', 'summary__freight', 'summary__total'];
  const summaryVal = [summarySubtotal, freight, summarySubtotal + freight];
  summaryClassName.forEach((elClassName, index) => {
    const valEl = document.querySelector(`.${elClassName} .value`);
    valEl.innerText = summaryVal[index];
  });
}

function isTargetItem(i, id, color, size) {
  const sameProduct = cartProductList[i].id === id;
  const sameColor = cartProductList[i].color.code === color.code;
  const sameSize = cartProductList[i].size === size;
  return sameProduct && sameColor && sameSize;
}

function handlerQuantity(e, price) {
  const productIndex = Array.from(e.path[3].childNodes).indexOf(e.path[2]);
  const newQty = e.target.value;
  cartProductList[productIndex].qty = Number(newQty);
  myStorage.setItem('list', JSON.stringify(cartProductList));
  e.path[2].childNodes[4].innerText = `NT.${price * newQty}`;

  renewSummarySubtotal();
  renderSummary();
}

function handlerDiscard(id, color, size) {
  const AllitemEl = document.querySelectorAll('.item');
  for (let i = 0; i < cartProductList.length; i += 1) {
    if (isTargetItem(i, id, color, size)) {
      const cartCountEl = document.querySelectorAll('.count');
      cartProductList.splice(i, 1);
      myStorage.setItem('list', JSON.stringify(cartProductList));
      cartCountEl.forEach((el) => {
        const cart = el;
        cart.innerText = cartProductList.length;
      });
      cartHeaderTitle.innerText = `購物車(${cartProductList.length})`;
      itemsEl.removeChild(AllitemEl[i]);
      if (!cartProductList.length) {
        itemsEl.innerHTML = "<h4 style='text-align: center; margin:10px 0px -10px'> 購物車內無商品 </h4>";
      }
      alert('商品已從購物車移除');
      break;
    }
  }
  renewSummarySubtotal();
  renderSummary();
}

function renderItemImage(itemEl, name, id) {
  const imgEl = document.createElement('img');
  imgEl.className = 'item-img';
  imgEl.src = `https://api.appworks-school.tw/assets/${id}/main.jpg`;
  imgEl.alt = `${name}-商品照片`;
  itemEl.appendChild(imgEl);
}

function renderItemDetail(itemEl, name, id, color, size) {
  const itemDetailEl = document.createElement('div');
  itemDetailEl.className = 'item-detail';

  const detailElsClassName = ['name', 'id', 'color', 'size'];
  const detailData = [name, id, `顏色｜${color.name}`, `尺寸｜${size}`];
  detailElsClassName.forEach((elClassName, index) => {
    const detailEl = document.createElement('div');
    detailEl.className = elClassName;
    detailEl.innerText = detailData[index];
    itemDetailEl.appendChild(detailEl);
  });
  itemEl.appendChild(itemDetailEl);
}

function renderItemInfo(itemEl, price, qty, stock) {
  const quantityEl = document.createElement('select');
  const priceEl = document.createElement('div');
  const subtotalEl = document.createElement('div');

  quantityEl.name = 'quantity';
  quantityEl.className = 'quantity__select';
  quantityEl.addEventListener('change', (e) => handlerQuantity(e, price));
  for (let i = 1; i < stock + 1; i += 1) {
    const option = document.createElement('option');
    option.value = `${i}`;
    option.innerText = i;
    if (i === qty) {
      option.selected = true;
    }
    quantityEl.appendChild(option);
  }
  priceEl.className = 'price';
  priceEl.innerText = `NT.${price}`;
  subtotalEl.className = 'subtotal';
  subtotalEl.innerText = `NT.${price * qty}`;

  const itemInfoElsClassName = ['item-quantity', 'item-price', 'item-subtotal'];
  const itemInfoTexts = ['數量', '單價', '小計'];
  const itemInfoDataEls = [quantityEl, priceEl, subtotalEl];

  itemInfoElsClassName.forEach((elClassName, index) => {
    const itemInfoEl = document.createElement('div');
    const itemInfoTextEl = document.createElement('div');

    itemInfoEl.className = elClassName;
    itemInfoTextEl.className = 'item-text';
    itemInfoTextEl.innerText = itemInfoTexts[index];

    itemInfoEl.appendChild(itemInfoTextEl);
    itemInfoEl.appendChild(itemInfoDataEls[index]);
    itemEl.appendChild(itemInfoEl);
  });
}

function renderDiscard(itemEl, id, color, size) {
  const discard = document.createElement('div');
  const discardImg = document.createElement('img');
  discard.className = 'discard';
  discardImg.src = 'images/cart-remove.png';
  discardImg.alt = 'discard-icon';
  discardImg.addEventListener('click', () => handlerDiscard(id, color, size));
  discardImg.addEventListener('mouseenter', () => {
    discardImg.src = 'images/cart-remove-hover.png';
  });
  discardImg.addEventListener('mouseleave', () => {
    discardImg.src = 'images/cart-remove.png';
  });
  discard.appendChild(discardImg);
  itemEl.appendChild(discard);
}

for (let i = 0; i < cartProductList.length; i += 1) {
  const itemData = cartProductList[i];
  const {
    name, id, color, size, stock, qty, price,
  } = itemData;
  const itemEl = document.createElement('div');
  itemEl.className = 'item';
  itemsEl.appendChild(itemEl);

  renderItemImage(itemEl, name, id);
  renderItemDetail(itemEl, name, id, color, size);
  renderItemInfo(itemEl, price, qty, stock, id, color, size);
  renderDiscard(itemEl, id, color, size);

  summarySubtotal += price * qty;
}

renderSummary();
