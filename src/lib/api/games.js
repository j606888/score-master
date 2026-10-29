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

export const createDraft = async (room_id, player_id, score) => {
  try {
    await axiosClient.post(`/rooms/${room_id}/drafts`, { player_id, score })
  } catch (error) {
    console.error(error)
    throw error
  }
}

// 覆寫這位玩家的草稿；score 為 null 時刪除
export const setDraft = async (room_id, player_id, score) => {
  try {
    await axiosClient.put(`/rooms/${room_id}/drafts`, { player_id, score })
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteDraft = async (room_id, id) => {
  try {
    await axiosClient.delete(`/rooms/${room_id}/drafts/${id}`)
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteAllDraft = async (room_id) => {
  try {
    await axiosClient.delete(`/rooms/${room_id}/drafts`)
  } catch (error) {
    console.error(error)
    throw error
  }
}
