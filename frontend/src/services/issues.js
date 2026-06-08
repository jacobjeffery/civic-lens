import api from "./api"

export const getAll = async (params) => {
    const response = await api.get("/issues", { params })
    return response.data
}

export const getById = async (id) => {
    const response = await api.get(`/issues/${id}`)
    return response.data
}

export const getMine = async () => {
    const response = await api.get("/issues/mine")
    return response.data
}

export const create = async (issue) => {
    const response =  await api.post("/issues", issue)
    return response.data
}

export const update = async (id, updates) => {
    const response = await api.put(`/issues/${id}`, updates)
    return response.data
}

export const remove = async (id) => {
    const response = await api.delete(`/issues/${id}`)
    return response.data
}