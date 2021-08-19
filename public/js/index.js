/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './login';
import { updateAccount } from './accounts';
import { bookTour } from './booking';
import { getTour } from './get-tour';

const loginForm = document.querySelector('.login--form');
const mapBox = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const accountForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book--tour');
const signupForm = document.querySelector('.sign-up-form');
const searchBar = document.querySelector('.nav__search');

if (searchBar) {
  searchBar.addEventListener('keyup', async e => {
    e.preventDefault();
    const searchInput = e.target.value.toLowerCase();

    getTour(searchInput);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();

    document.querySelector('.signup--btn').textContent = '...Processing';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    await signup(name, email, password, passwordConfirm);

    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('passwordConfirm').value = '';
    document.getElementById('passwordConfirm').blur();
    document.querySelector('.signup--btn').textContent = 'Sign up';
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (accountForm) {
  accountForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const photo = document.getElementById('photo').files[0];
    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);

    updateAccount(form, 'data');
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating ... ';

    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;

    await updateAccount(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    login(email, password);
  });
}

if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );

  displayMap(locations);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
