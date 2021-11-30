export const myStorage = window.localStorage;
export const cartProductList = JSON.parse(myStorage.getItem('list')) || [];
export const fbStatus = { status: '' };

const cartCountEl = document.querySelectorAll('.count');
const cartDesktopImgEl = document.querySelector('.desktop-header .cart img');
const memberEls = document.querySelectorAll('.member');
const memberDesktopImgEl = document.querySelector('.desktop-header .member img');
const searchElements = document.querySelectorAll('.search');
const mobileSearchElement = document.querySelector('.mobile-header .search');

cartCountEl.forEach((el) => {
  const cart = el;
  cart.innerText = cartProductList.length;
});

export function fbLogin() {
  return new Promise((resolve) => {
    FB.login(
      (res) => {
        resolve(res);
      },
      { scope: 'public_profile,email', auth_type: 'rerequest' },
    );
  });
}
export function loginAlert(res) {
  if (res.status === 'connected') {
    alert('登入成功');
  } else {
    alert('登入失敗');
  }
}

function login() {
  const timer = 500;
  fbLogin().then((res) => {
    statusChangeCallback(res); // eslint-disable-line no-use-before-define
    setTimeout(() => {
      loginAlert(res);
    }, timer);
  });
}

function setMemberBtn() {
  function redirectToProfile() {
    window.location.href = './profile.html';
  }
  if (fbStatus.status === 'connected') {
    memberEls.forEach((memberEl) => {
      memberEl.removeEventListener('click', login);
      memberEl.addEventListener('click', redirectToProfile);
    });
  } else {
    memberEls.forEach((memberEl) => {
      memberEl.addEventListener('click', login);
    });
  }
}

export function statusChangeCallback(res) {
  fbStatus.status = res.status;
  setMemberBtn();
  return res.status;
}

window.fbAsyncInit = function () {
  FB.init({
    appId: '184401893795882',
    cookie: true,
    xfbml: true,
    version: 'v11.0',
  });

  FB.getLoginStatus((res) => {
    statusChangeCallback(res);
  });
};

(function (d, s, id) {
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  const js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function btnHover(btnEls, btnType) {
  const el = btnEls;
  el.addEventListener('mouseenter', (e) => {
    e.target.src = `images/${btnType}-hover.png`;
  });
  el.addEventListener('mouseleave', (e) => {
    e.target.src = `images/${btnType}-desktop.png`;
  });
}

btnHover(cartDesktopImgEl, 'cart');
btnHover(memberDesktopImgEl, 'member');

function handlerSearch(e) {
  const search = e.currentTarget;
  if (e.keyCode === 13) {
    const searchValue = search.value;
    window.location.href = `./index.html?tag=${searchValue}`;
    search.value = '';
  }
}

function handlerMobileSearchOn(e) {
  e.currentTarget.classList.add('mobile-search');
}

function handlerMobileSearchOff(e) {
  const mobileSearchBottom = mobileSearchElement.getBoundingClientRect().bottom;
  const mouseY = e.y;
  if (mouseY > mobileSearchBottom) {
    mobileSearchElement.className = 'search';
  }
}

function createSearchFeature() {
  searchElements.forEach((search) => {
    search.addEventListener('keydown', handlerSearch);
  });

  mobileSearchElement.addEventListener('click', handlerMobileSearchOn);
  window.addEventListener('click', handlerMobileSearchOff);
}

createSearchFeature();

export function getUrl(pathname, searchParams = '') {
  const url = new URL('https://api.appworks-school.tw/api/1.0');
  pathname.forEach((p) => {
    url.pathname += `/${p}`;
  });
  url.search = new URLSearchParams(searchParams);
  return url;
}

export function fetchData(api, body, headers) {
  return fetch(api, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
}
