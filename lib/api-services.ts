import apiClient from "./api-client"

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    console.log("Sending login request with username:", username)

    const response = await apiClient.post("/token/", {
      username,
      password,
    })

    console.log("Login successful, received tokens")
    const { access, refresh } = response.data
    localStorage.setItem("token", access)
    localStorage.setItem("refreshToken", refresh)
    return response.data
  },

  register: async (userData: any) => {
    const response = await apiClient.post("/register/", userData)
    return response.data
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
  },
}

// User services
export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/users/me/")
      return response.data
    } catch (error) {
      console.error("Error fetching current user:", error)
      throw error
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      const response = await apiClient.patch("/user-profiles/me/", profileData)
      return response.data
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },
}

// Account services
export const accountService = {
  getAccounts: async () => {
    try {
      const response = await apiClient.get("/accounts/")
      return response.data
    } catch (error) {
      console.error("Error fetching accounts:", error)
      throw error
    }
  },

  getAccount: async (id: number) => {
    try {
      const response = await apiClient.get(`/accounts/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error)
      throw error
    }
  },

  createAccount: async (accountData: any) => {
    try {
      const response = await apiClient.post("/accounts/", accountData)
      return response.data
    } catch (error) {
      console.error("Error creating account:", error)
      throw error
    }
  },

  deposit: async (accountId: number, amount: number, description: string, categoryId?: number) => {
    try {
      const response = await apiClient.post(`/accounts/${accountId}/deposit/`, {
        amount,
        description,
        category_id: categoryId,
      })
      return response.data
    } catch (error) {
      console.error(`Error depositing to account ${accountId}:`, error)
      throw error
    }
  },

  withdraw: async (accountId: number, amount: number, description: string, categoryId?: number) => {
    try {
      const response = await apiClient.post(`/accounts/${accountId}/withdraw/`, {
        amount,
        description,
        category_id: categoryId,
      })
      return response.data
    } catch (error) {
      console.error(`Error withdrawing from account ${accountId}:`, error)
      throw error
    }
  },

  transfer: async (accountId: number, recipientAccountId: number, amount: number, description: string) => {
    try {
      const response = await apiClient.post(`/accounts/${accountId}/transfer/`, {
        recipient_account_id: recipientAccountId,
        amount,
        description,
      })
      return response.data
    } catch (error) {
      console.error(`Error transferring from account ${accountId}:`, error)
      throw error
    }
  },
}

// Transaction services
export const transactionService = {
  getTransactions: async (filters = {}) => {
    try {
      const response = await apiClient.get("/transactions/", { params: filters })
      return response.data
    } catch (error) {
      console.error("Error fetching transactions:", error)
      throw error
    }
  },

  getSpendingByCategory: async (accountId?: number) => {
    try {
      const response = await apiClient.get("/transactions/spending_by_category/", {
        params: { account_id: accountId },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching spending by category:", error)
      throw error
    }
  },

  getMonthlySpending: async (accountId?: number) => {
    try {
      const response = await apiClient.get("/transactions/monthly_spending/", {
        params: { account_id: accountId },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching monthly spending:", error)
      throw error
    }
  },
}

// Notification services
export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get("/notifications/")
      return response.data
    } catch (error) {
      console.error("Error fetching notifications:", error)
      throw error
    }
  },

  markAsRead: async (id: number) => {
    try {
      const response = await apiClient.post(`/notifications/${id}/mark_as_read/`)
      return response.data
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error)
      throw error
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.post("/notifications/mark_all_as_read/")
      return response.data
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  },
}
