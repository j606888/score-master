import axiosClient from './axiosClient'

export const createRoom = async (room_id, name) => {
  await axiosClient.post(`/rooms/${room_id}`, { name });
}

export const updateActiveRoom = async (room_id, new_room_id) => {
  await axiosClient.post(`/rooms/${room_id}/active`, { new_room_id });
}