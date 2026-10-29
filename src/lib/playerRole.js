export const PLAYER_ROLE = {
  NORMAL: 0,
  // 場地費：只收不輸，不列入排行與出場數
  FEE: 1,
}

export const isFee = (player) => player?.role === PLAYER_ROLE.FEE

export const DEFAULT_MENU_KEYWORDS = ["麻將", "德州"]
