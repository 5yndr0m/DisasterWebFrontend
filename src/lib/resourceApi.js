import { publicClient, protectedClient } from "./api";

export const resourceApi = {
  public: {
    getFacilities: async (params) => {
      const response = await publicClient.get("/resources/facilities", {
        params,
      });
      return response.data;
    },

    getGuides: async (params) => {
        try {
          const response = await publicClient.get("/resources/guides", { params });
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || "Failed to fetch guides");
        }
      },

    getEmergencyContacts: async (params) => {
      const response = await publicClient.get("/resources/emergency-contacts", {
        params,
      });
      return response.data;
    },

    getNearbyFacilities: async (params) => {
      const response = await publicClient.get("/resources/facilities/nearby", {
        params,
      });
      return response.data;
    },

    getResourceById: async (id) => {
        try {
          const response = await publicClient.get(`/resources/${id}`);
          return response.data.resource || response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || "Failed to fetch resources");
        }
      },
  },

  protected: {
    getAllResources: async () => {
      const response = await protectedClient.get("/resources");
      return response.data;
    },

    getLastMonthVerifiedResources: async () => {
      const response = await protectedClient.get(
        "/resources/verified/last-month",
      );
      return response.data;
    },

    createResource: async (resourceData) => {
      const response = await protectedClient.post("/resources", resourceData);
      return response.data;
    },

    updateResource: async (id, updateData) => {
      const response = await protectedClient.put(
        `/resources/${id}`,
        updateData,
      );
      return response.data;
    },

    deleteResource: async (id) => {
      const response = await protectedClient.delete(`/resources/${id}`);
      return response.data;
    },
  },
};
