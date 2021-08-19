/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const updateAccount = async (data, type) => {
  try {
    const urlType = type === 'password' ? 'updateMyPassword' : 'updateMe';

    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/users/${urlType}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} sucessfully updated `);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
