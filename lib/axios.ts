import Axios, { InternalAxiosRequestConfig } from "axios";
import { GetServerSidePropsContext } from "next";
import Cookies from "js-cookie";

let context = <GetServerSidePropsContext>{};

export const Backend = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL
});


const isCallWithServer = () => {
  return typeof window === "undefined";
}


Backend.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  
  // Setup header for using in sabuyd cms
  // config.headers["x-sbd-service"] = 'bff-cms';
  
  const accessToken = Cookies.get('token')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (isCallWithServer() && context?.req?.cookies) {
    const token = context?.req?.cookies.token;
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
})

Backend.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(error);
  }
);

export const initHeaderWithServerSide = (_ctx: GetServerSidePropsContext) => {
  context = _ctx;
}