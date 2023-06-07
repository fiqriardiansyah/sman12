import { AxiosRequestConfig } from "axios";

export interface SelectOption {
    label: string;
    value: any;
}

export interface BaseResponse<T = any> {
    data: T;
    status: number;
    message: string;
}

export interface GetMethodParams<T = any> {
    url: string;
    config?: AxiosRequestConfig<T>;
}

export interface PostMethodParams<T = any> {
    url: string;
    data?: any;
    config?: AxiosRequestConfig<T>;
}

export interface PutMethodParams<T = any> {
    url: string;
    data?: any;
    config?: AxiosRequestConfig<T>;
}

export interface DeleteMethodParams<T = any> {
    url: string;
    config?: AxiosRequestConfig<T>;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        email: string;
        name: string;
    };
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface RegisterResponse {
    token: string;
    user: {
        email: string;
        name: string;
    };
}

export interface StaffProfile {
    name: string;
    email: string;
    nuptk?: string;
    phone?: string;
    gender?: number;
    address?: string;
    position?: string;
    photo?: string;
}
