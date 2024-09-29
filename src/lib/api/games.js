import axiosClient from './axiosClient'

export const createGame = async (room_id, records) => {
  try {
    const response = await axiosClient.post(`/rooms/${room_id}/games`, { records })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const syncDraft = async (room_id, draftData) => {
  try {
    await axiosClient.put(`/rooms/${room_id}/drafts`, { draftData })
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteDraft = async (room_id) => {
  try {
    await axiosClient.delete(`/rooms/${room_id}/drafts`)
  } catch (error) {
    console.error(error)
    throw error
  }
}
