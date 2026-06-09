import api from "./api"

export const getAll = async () => {
    const response = await api.get("/issues/categories")
    return response.data
}