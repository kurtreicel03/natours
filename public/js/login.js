/*eslint-disable*/
'user-strict';
import axios from 'axios';
import { showAlert, hideAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Sucessfully Log in');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });

    if (res) {
      location.reload(true);
      location.assign('/');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', `We send a verification email to ${email}`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
