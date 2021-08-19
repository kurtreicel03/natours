/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const getTour = async searchInput => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/tours`,
    });
    const filter = res.data.data.data.filter(tour => {
      const tourName = tour.name.split(' ').slice(1, 2).join('').toLowerCase();
      return tourName.includes(searchInput);
    });
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
