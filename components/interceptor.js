import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useErrorHandler } from "./ErrorHandler";
import { useNavigation } from "@react-navigation/native";

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
        console.log("test");
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
      if (response.status.toString() === 401) {
        const navigate = useNavigation();
        navigate.navigate("GetStarted");
      }
      return response;
    },
    async (error) => {
      const navigate = useNavigation();
      if (error.response && error.response.status === 401) {
        navigate.navigate("GetStarted");
      }
      return Promise.reject(error);
    }
  );
};
