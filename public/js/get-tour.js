/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const getTour = async searchInput => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/api/v1/tours`,
    });
    const filter = res.data.data.data.filter(tour => {
      const tourName = tour.name.split(' ').slice(1, 2).join('').toLowerCase();
      return tourName.includes(searchInput);
    });

    console.log(filter);
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
