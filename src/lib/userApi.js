import { publicClient, protectedClient } from "./api";

export const userApi = {
  public: {
    login: async (credentials) => {
      try {
        const response = await publicClient.post("/users/login", credentials);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
    },

    register: async (userData) => {
      try {
        const response = await publicClient.post("/users/register", userData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Registration failed");
      }
    },

    forgotPassword: async (data) => {
      try {
        const response = await publicClient.post("/users/forgot-password", data);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to process forgot password request");
      }
    },

    resetPassword: async (data) => {
      try {
        const response = await publicClient.post("/users/reset-password", data);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to reset password");
      }
    },
  },

  protected: {
    getProfile: async () => {
      try {
        const response = await protectedClient.get("/users/me");
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch profile");
      }
    },

    updateProfile: async (userData) => {
      try {
        const response = await protectedClient.patch("/users/me", userData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update profile");
      }
    },

    updatePreferences: async (preferences) => {
      try {
        const response = await protectedClient.patch("/users/me/preferences", { preferences });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update preferences");
      }
    },

    updateAvatar: async (formData) => {
      try {
        const response = await protectedClient.post("/users/me/avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update avatar");
      }
    },

    changePassword: async (passwordData) => {
      try {
        const response = await protectedClient.patch("/users/me/password", passwordData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to change password");
      }
    },

    deleteAccount: async () => {
      try {
        const response = await protectedClient.delete("/users/me");
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete account");
      }
    },

    updatePushToken: async (pushToken) => {
      try {
        const response = await protectedClient.patch("/users/me/push-token", { pushToken });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update push token");
      }
    },
  },
};