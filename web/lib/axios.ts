// ...import axios and instance
instance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) window.location.href = "/login";
    if (err.response?.status === 403) window.location.href = "/forbidden";
    return Promise.reject(err);
  }
);
export default instance;