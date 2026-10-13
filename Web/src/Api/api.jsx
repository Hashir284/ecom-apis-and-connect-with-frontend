import axios from "axios";

const api = axios.create({
    // baseURL: window.location.href.split(":")[0] === 'http' ? 'http://localhost:4000/api/' : '/api/',
    baseURL: typeof window !== "undefined" && window.location.protocol === "http:" ? 'http://localhost:4000/api/' : '/api/',
    withCredentials: true
})

export default api;