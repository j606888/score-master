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