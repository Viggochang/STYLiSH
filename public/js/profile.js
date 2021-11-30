// eslint-disable-next-line import/extensions
import { getUrl, fetchData } from './base.js';

const pictureEl = document.querySelector('.picture');
const nameEl = document.querySelector('.name');
const emailEl = document.querySelector('.email');
const logoutBtn = document.querySelector('.logout');

function renderUserInfo(res) {
  const {
    user: { name, email, picture },
  } = res.data;
  nameEl.appendChild(document.createTextNode(name));
  emailEl.appendChild(document.createTextNode(email));
  pictureEl.src = picture;
  pictureEl.alt = `${name}-照片`;
}

function statusChangeProfile(response) {
  if (response.status === 'connected') {
    const { graphDomain, accessToken } = response.authResponse;
    const signinBody = {
      provider: graphDomain,
      access_token: accessToken,
    };

    const signinApi = getUrl(['user', 'signin']);
    fetchData(signinApi, signinBody, {
      'Content-type': 'application/json',
    })
      .then((res) => res.json())
      .then((res) => renderUserInfo(res));
  } else {
    window.location.href = './';
  }
}

setTimeout(() => {
  FB.getLoginStatus((response) => {
    statusChangeProfile(response);
  });
}, 500);

function logout() {
  FB.logout();
  alert('登出成功');
  window.location.href = './';
}

logoutBtn.addEventListener('click', logout);
