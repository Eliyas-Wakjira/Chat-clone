import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://chatgpt.eliyastech.com/api',
});

export default axiosInstance;