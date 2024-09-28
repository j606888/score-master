import axiosClient from './axiosClient'

export const addPlayer = async (room_id, player) => {
  try {
    const response = await axiosClient.post(`/rooms/${room_id}/players`, player)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}