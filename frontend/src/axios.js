import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3888/api',
});

export default axiosInstance;