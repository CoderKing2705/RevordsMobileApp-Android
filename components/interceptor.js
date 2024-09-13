import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useErrorHandler } from "./ErrorHandler";
import { EventBus } from "./EventEmitter";

export const setUpInterceptor = async () => {
  const originalFetch = window.fetch;

  window.fetch = async function (url, options) {
    const token = await AsyncStorage.getItem("accessToken");
    if (!options.headers) {
      options.headers = {};
    }
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

      const response = await originalFetch(url, options);
  
      // Handle 401 Unauthorized status
      if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('accessToken');
        EventBus.emit('logout'); // Emit logout event
      }
      return originalFetch(url, options);    
  };
  axios.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        await useErrorHandler(
          "(Android): VerifyNumber > setUpInterceptor " + error
        );
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  axios.interceptors.response.use(
    (response) => {
      const token =  AsyncStorage.getItem("accessToken");
      if (response.status.toString() === 401) {
        AsyncStorage.removeItem("token");
        AsyncStorage.removeItem('accessToken');
        EventBus.emit('logout'); // Emit logout event
      }
      return response;
    },
    async (error) => {
      if (error.response && error.response.status === 401) {
        AsyncStorage.removeItem("token");
        AsyncStorage.removeItem('accessToken');
        EventBus.emit('logout'); // Emit logout event
      }
      return Promise.reject(error);
    }
  );
};
