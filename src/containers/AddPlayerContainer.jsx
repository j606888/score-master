import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import styled from "styled-components"
import { useState } from "react"
import useSWR from "swr"
import Head from "next/head"
import { addPlayer, updatePlayerRole } from "@/lib/api/players"
import LoadingSkeleton from "@/components/LoadingSkeleton"
import PageHeader, { COLORS } from "@/components/PageHeader"
import { PLAYER_ROLE, isFee } from "@/lib/playerRole"

const ROLE_OPTIONS = [
  { role: PLAYER_ROLE.NORMAL, label: "一般玩家", sub: "有輸有贏，列入排行與出場數" },
  { role: PLAYER_ROLE.FEE, label: "場地費", sub: "只收不輸，不列入排行，選單上只顯示累積金額" },
]

const AddPlayerContainer = ({ room_id }) => {
  const [playerName, setPlayerName] = useState("")
  const [role, setRole] = useState(PLAYER_ROLE.NORMAL)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const { data, isLoading, mutate } = useSWR(
    room_id ? `/api/rooms/${room_id}/players` : null
  )
  const { data: settings } = useSWR(room_id ? `/api/rooms/${room_id}/settings` : null)

  const handleAddPlayer = async () => {
    setLoading(true)
    try {
      await addPlayer(room_id, { name: playerName, role })
      setPlayerName("")
      setRole(PLAYER_ROLE.NORMAL)
      mutate()
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async () => {
    const nextRole = isFee(editing) ? PLAYER_ROLE.NORMAL : PLAYER_ROLE.FEE
    await updatePlayerRole(room_id, editing.id, nextRole)
    setEditing(null)
    mutate()
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const players = data?.players || []
  const fees = players.filter(isFee)
  const normals = players.filter(player => !isFee(player))

  return (
    <>
      <Head>
        <title>玩家與場地費</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Container>
        <PageHeader subtitle={settings?.name} title="玩家" />
        <main>
          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault()
              if (playerName.trim() && !loading) handleAddPlayer()
            }}
          >
            <label className="field">
              <span className="label">名稱</span>
              <input
                type="text"
                value={playerName}
                placeholder="輸入名稱"
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </label>
            <fieldset className="field">
              <legend className="label">角色</legend>
              {ROLE_OPTIONS.map(option => (
                <label
                  key={option.role}
                  className={`role ${role === option.role ? "on" : ""} ${option.role === PLAYER_ROLE.FEE ? "fee" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={role === option.role}
                    onChange={() => setRole(option.role)}
                  />
                  <span className="role-text">
                    <span className="role-label">{option.label}</span>
                    <span className="role-sub">{option.sub}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <button type="submit" className="create" disabled={loading || !playerName.trim()}>
              {loading ? "建立中…" : "建立"}
            </button>
          </form>

          <section className="group">
            <span className="label">場地費 · 可以有多個</span>
            {fees.length === 0 && <p className="empty">還沒有場地費。點下方玩家也可以改成場地費。</p>}
            {fees.map(fee => (
              <button type="button" key={fee.id} className="fee-row" onClick={() => setEditing(fee)}>
                <span className="fee-name">{fee.name}</span>
                <span className="fee-total">累積 <b>{fee.total_score.toLocaleString("en-US")}</b></span>
              </button>
            ))}
          </section>

          <section className="group">
            <span className="label">一般玩家 · {normals.length} 人</span>
            <div className="chips">
              {normals.map(player => (
                <button type="button" key={player.id} className="chip" onClick={() => setEditing(player)}>
                  {player.name}
                </button>
              ))}
            </div>
          </section>
        </main>
      </Container>

      <Dialog open={!!editing} onClose={() => setEditing(null)}>
        <DialogTitle>{editing?.name}</DialogTitle>
        <DialogContent>
          {isFee(editing)
            ? "改回一般玩家？之後會列入排行與出場數。"
            : "改成場地費？之後不列入排行，記一局時只能填正數。"}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>取消</Button>
          <Button variant="contained" onClick={handleChangeRole} sx={{ bgcolor: COLORS.felt }}>
            {isFee(editing) ? "改回一般玩家" : "改成場地費"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const Container = styled.div`
  min-height: 100vh;
  background: ${COLORS.ground};
  color: ${COLORS.text};
  font-family: -apple-system, "PingFang TC", "Noto Sans TC", sans-serif;

  main {
    padding: 14px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 600px;
    margin: 0 auto;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 0;

    input[type="text"] {
      height: 44px;
      border-radius: 8px;
      border: 1px solid ${COLORS.border};
      padding: 0 12px;
      font-size: 16px;
      outline: 0;

      &:focus {
        border-color: ${COLORS.felt};
      }
    }
  }

  .label {
    font-size: 13px;
    font-weight: 700;
    color: ${COLORS.label};
    margin-bottom: 6px;
  }

  .role {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid ${COLORS.border};

    input {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      accent-color: ${COLORS.felt};
    }

    &.on {
      border: 2px solid ${COLORS.felt};
    }

    &.fee.on {
      border-color: #8a7a52;
      background: ${COLORS.feeBg};

      input {
        accent-color: ${COLORS.feeSub};
      }
    }
  }

  .role-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .role-label {
    font-size: 15px;
    font-weight: 600;
  }

  .role-sub {
    font-size: 12px;
    color: ${COLORS.muted};
  }

  .create {
    height: 48px;
    border-radius: 10px;
    border: 0;
    background: ${COLORS.felt};
    color: #fff;
    font-size: 16px;
    font-weight: 700;

    &:disabled {
      opacity: 0.4;
    }
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .label {
      margin-bottom: 0;
    }
  }

  .empty {
    font-size: 13px;
    color: ${COLORS.muted};
  }

  .fee-row {
    background: ${COLORS.feeBg};
    border: 1px dashed ${COLORS.feeBorder};
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    color: ${COLORS.feeText};
    text-align: left;
  }

  .fee-name {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
  }

  .fee-total {
    font-size: 13px;
    color: ${COLORS.feeSub};

    b {
      font-weight: 800;
      color: ${COLORS.feeText};
    }
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid ${COLORS.border};
    font-size: 14px;
    font-weight: 600;
    color: ${COLORS.text};
  }
`;

export default AddPlayerContainer
