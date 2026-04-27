import api from '../lib/axios.js';
import type { TripResponse, TripDetailResponse } from '../types/trip.types.js';

// Generic wrapper matching your backend's sendResponse utility
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const tripService = {
  uploadTrip: async (file: File): Promise<ApiResponse<TripResponse>> => {
    // We must use FormData because we are transmitting a binary CSV file
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<TripResponse>>('/trip/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getAllTrips: async (): Promise<ApiResponse<TripResponse[]>> => {
    const response = await api.get<ApiResponse<TripResponse[]>>('/trip');
    return response.data;
  },

  getTripById: async (id: string): Promise<ApiResponse<TripDetailResponse>> => {
    const response = await api.get<ApiResponse<TripDetailResponse>>(`/trip/${id}`);
    return response.data;
  },

  deleteTrip: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/trip/${id}`);
    return response.data;
  }
};
