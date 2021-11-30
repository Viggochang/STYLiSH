const orderNumEl = document.querySelector('#order-num');
const orderNum = new URLSearchParams(window.location.search).get('number');
orderNumEl.appendChild(document.createTextNode(orderNum));

if (!orderNum) {
  window.location.href = './';
}
