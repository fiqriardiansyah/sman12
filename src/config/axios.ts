/* eslint-disable react/react-in-jsx-scope */
import axios from "axios";
import { errorLogger } from "axios-logger";
import Cookies from "js-cookie";
import Utils from "utils";
import { TOKEN_USER } from "utils/constant";

const axiosClient = axios.create();

axiosClient.defaults.baseURL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_PROD_URL : process.env.REACT_APP_DEV_URL;

axiosClient.defaults.timeout = 1000000;

axiosClient.defaults.withCredentials = true;

axiosClient.interceptors.request.use(
    (req) => {
        req.headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT",
            Authorization: Cookies.get(TOKEN_USER)!,
        } as any;
        return req;
    },
    (error) => (process.env.NODE_ENV === "development" ? errorLogger(error) : error)
);

axiosClient.interceptors.response.use(
    (res) => {
        const { status, data } = res;
        if (status === 401 || data?.status === 401) {
            Utils.SignOut();
            // window.location.reload();
        }
        return res;
    },
    (error) => {
        if (error.response?.status === 401) {
            Utils.SignOut();
            // window.location.reload();
        }
        return process.env.NODE_ENV === "development" ? errorLogger(error) : error;
    }
);

export default axiosClient;
