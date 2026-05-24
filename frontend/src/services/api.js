import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const BASE = `${API_URL}/api`;

// Returns the URL to stream a book's PDF from the backend
export const getBookPdfUrl = (bookId) => `${BASE}/books/${bookId}/pdf`;

// ---- AUTH ----
export const registerUser = (data) => axios.post(`${BASE}/auth/register`, data);
export const registerAdmin = (data) => axios.post(`${BASE}/auth/register-admin`, data);
export const loginUser = (data) => axios.post(`${BASE}/auth/login`, data);
export const getMe = () => axios.get(`${BASE}/auth/me`);

// ---- BOOKS ----
export const getBooks = (params) => axios.get(`${BASE}/books`, { params });
export const getBookById = (id) => axios.get(`${BASE}/books/${id}`);
export const addBook = (formData) => axios.post(`${BASE}/books`, formData);
export const updateBook = (id, formData) => axios.put(`${BASE}/books/${id}`, formData);
export const deleteBook = (id) => axios.delete(`${BASE}/books/${id}`);
export const getCategoryStats = () => axios.get(`${BASE}/books/categories`);

// ---- BORROW ----
export const borrowBook = (bookId) => axios.post(`${BASE}/borrow`, { bookId });
export const returnBook = (id) => axios.put(`${BASE}/borrow/return/${id}`);
export const getMyHistory = () => axios.get(`${BASE}/borrow/my-history`);
export const getAllBorrowRecords = (params) => axios.get(`${BASE}/borrow/all`, { params });
export const getDashboardStats = () => axios.get(`${BASE}/borrow/stats`);

// ---- USERS ----
export const getAllUsers = (params) => axios.get(`${BASE}/users`, { params });
export const updateUserStatus = (id) => axios.patch(`${BASE}/users/${id}/status`);
