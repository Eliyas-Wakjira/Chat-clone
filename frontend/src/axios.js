

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://chatgpt.eliyastech.com/api';

const API = axios.create({
  baseURL: API_URL,
});

export default API;