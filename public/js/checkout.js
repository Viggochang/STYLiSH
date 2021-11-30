import {
  getUrl,
  fetchData,
  fbLogin,
  loginAlert,
  statusChangeCallback,
  cartProductList,
  myStorage,
  fbStatus,
  // eslint-disable-next-line import/extensions
} from './base.js';

const nameInput = document.querySelector('#name');
const mailInput = document.querySelector('#mail');
const phoneInput = document.querySelector('#phone');
const addressInput = document.querySelector('#address');
const deliveryTimeEls = document.querySelectorAll('.buyer__time input');
const subtotalEl = document.querySelector('.summary__subtotal .value');
const freightEl = document.querySelector('.summary__freight .value');
const totalEl = document.querySelector('.summary__total .value');
const mailRegular = /^\w+((\.|-)\w+)*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
const phoneRegular = /^[0]{1}[9]{1}[0-9]{8}/;
const TPstatus = {
  numberStatus: 1,
  expiryStatus: 1,
  ccvStatus: 1,
};

let tokenForCheckout = '';

function getTokenForCheckout(loginRes) {
  const { graphDomain, accessToken } = loginRes.authResponse;
  const signinBody = {
    provider: graphDomain,
    access_token: accessToken,
  };
  const signinApi = getUrl(['user', 'signin']);
  fetchData(signinApi, signinBody, {
    'Content-type': 'application/json',
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.data) {
        tokenForCheckout = res.data.access_token;
      }
    });
}

const timer = 500;
setTimeout(() => {
  if (fbStatus.ststus === 'connected') {
    FB.getLoginStatus((res) => {
      getTokenForCheckout(res);
    });
  }
}, timer);

const appId = '12348';
const appKey = 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF';
function getConfig() {
  const questions = {
    number: {
      element: '#card-number',
      placeholder: '**** **** **** ****',
    },
    expirationDate: {
      element: '#card-expiration-date',
      placeholder: 'MM / YY',
    },
    ccv: {
      element: '#card-ccv',
      placeholder: 'ccv',
    },
  };

  return {
    fields: questions,
    styles: {
      '.valid': { color: 'green' },
      '.invalid': { color: 'red' },
    },
  };
}

TPDirect.setupSDK(appId, appKey, 'sandbox');
TPDirect.card.setup(getConfig());
TPDirect.card.onUpdate((update) => {
  TPstatus.numberStatus = update.status.number;
  TPstatus.expiryStatus = update.status.expiry;
  TPstatus.ccvStatus = update.status.ccv;
});

function checkout(res) {
  const orderNum = res.data.number;
  myStorage.clear();
  window.location.href = `./thank.html?number=${orderNum}`;
}

function checkBuyerData(recipient) {
  const {
    name, phone, email, address,
  } = recipient;
  if (!name) {
    alert('請輸入收件人姓名');
    return 0;
  }
  if (email.search(mailRegular) === -1) {
    alert('Email有誤');
    return 0;
  }
  if (phone.search(phoneRegular) === -1) {
    alert('手機號碼有誤');
    return 0;
  }
  if (!address) {
    alert('請輸入收件地址');
    return 0;
  }
  return true;
}

function checkPaymentData() {
  if (TPstatus.numberStatus !== 0) {
    alert('信用卡號碼有誤');
    return 0;
  }
  if (TPstatus.expiryStatus !== 0) {
    alert('有效期限有誤');
    return 0;
  }
  if (TPstatus.ccvStatus !== 0) {
    alert('安全碼有誤');
    return 0;
  }
  return true;
}

function getDeliveryTime() {
  for (let i = 0; i < deliveryTimeEls.length; i += 1) {
    const el = deliveryTimeEls[i];
    if (el.checked) {
      return el.value;
    }
  }
  return 0;
}

const checkoutApi = getUrl(['order', 'checkout']);
const productListForCheckout = JSON.parse(JSON.stringify(cartProductList));
productListForCheckout.map((item) => {
  const product = item;
  delete product.stock;
  return product;
});
const checkoutBody = {
  prime: '',
  order: {
    shipping: 'delivery',
    payment: 'credit_card',
    subtotal: subtotalEl.innerText,
    freight: freightEl.innerText,
    total: totalEl.innerText,
    list: [...productListForCheckout],
  },
};

function handlerCheck() {
  if (fbStatus.status !== 'connected') {
    fbLogin().then((res) => {
      statusChangeCallback(res);
      setTimeout(() => {
        loginAlert(res);
      }, timer);
      getTokenForCheckout(res);
    });
  } else {
    const recipient = {
      name: nameInput.value,
      phone: phoneInput.value,
      email: mailInput.value,
      address: addressInput.value,
      time: getDeliveryTime(),
    };
    checkoutBody.order.recipient = recipient;

    if (cartProductList.length === 0) {
      alert('購物車空空的耶');
      return 0;
    }
    if (!checkBuyerData(recipient)) {
      return 0;
    }
    if (!checkPaymentData()) {
      return 0;
    }

    const loading = document.querySelector('#loading');
    const loadingCover = document.querySelector('#loading-cover');
    loading.style = 'display: block';
    loadingCover.style = 'display: block';

    const getPrime = new Promise((resolve) => {
      TPDirect.card.getPrime((res) => {
        if (res.status === 0) {
          resolve(res.card.prime);
        }
      });
    });
    getPrime.then((prime) => {
      checkoutBody.prime = prime;
      fetchData(checkoutApi, checkoutBody, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenForCheckout}`,
      })
        .then((res) => res.json())
        .then((res) => {
          checkout(res);
        });
    });
  }
  return 0;
}

document.querySelector('#checkout').addEventListener('click', handlerCheck);
