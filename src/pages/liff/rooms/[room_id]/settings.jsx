import styled from "styled-components";
import Head from "next/head";
import { useState } from "react";
import useSWR from "swr";
import { getRoomPageProps } from "@/lib/roomAccess";
import { updateMenuKeywords } from "@/lib/api/rooms";
import PageHeader, { COLORS } from "@/components/PageHeader";

export async function getServerSideProps(context) {
  return getRoomPageProps(context);
}

const SettingsPage = ({ room_id }) => {
  const { data, mutate } = useSWR(`/api/rooms/${room_id}/settings`)
  const [newKeyword, setNewKeyword] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const keywords = data?.keywords || []

  const saveKeywords = async (next) => {
    setSaving(true)
    setError("")
    try {
      const result = await updateMenuKeywords(room_id, next)
      mutate({ ...data, keywords: result.keywords }, { revalidate: false })
      return true
    } catch (e) {
      setError(e?.response?.data?.error || "儲存失敗，請再試一次")
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const keyword = newKeyword.trim()
    if (!keyword) return
    if (keywords.includes(keyword)) {
      setError(`「${keyword}」已經有了`)
      return
    }
    if (await saveKeywords([...keywords, keyword])) setNewKeyword("")
  }

  const groups = [
    {
      title: "房間",
      items: [{ label: "切換房間", sub: data ? `目前：${data.name}` : "", href: `/liff/rooms/${room_id}/select` }],
    },
    {
      title: "玩家",
      items: [{
        label: "玩家與場地費",
        sub: data ? `${data.player_count} 位玩家 · ${data.fee_count} 個場地費` : "",
        href: `/liff/rooms/${room_id}/players/new`,
      }],
    },
    {
      title: "紀錄",
      items: [{ label: "歷史紀錄", sub: "每一局的輸贏明細", href: `/liff/rooms/${room_id}/games` }],
    },
  ]

  return (
  <>
    <Head>
      <title>設定</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
    <Container>
      <PageHeader subtitle={data?.name} title="設定" />
      <main>
        {groups.map(group => (
          <section key={group.title} className="group">
            <span className="group-title">{group.title}</span>
            <div className="list">
              {group.items.map(item => (
                <a key={item.label} href={item.href} className="item">
                  <span className="item-text">
                    <span className="item-label">{item.label}</span>
                    <span className="item-sub">{item.sub}</span>
                  </span>
                  <span className="chevron" aria-hidden="true">›</span>
                </a>
              ))}
            </div>
          </section>
        ))}

        <section className="group">
          <span className="group-title">叫出選單的關鍵字</span>
          <div className="list keywords">
            <p className="item-sub">在這個聊天室打出下面任一個字，就會跳出戰績選單。</p>
            <div className="chips">
              {keywords.map(keyword => (
                <span key={keyword} className="chip">
                  {keyword}
                  <button
                    type="button"
                    aria-label={`刪除 ${keyword}`}
                    disabled={saving || keywords.length <= 1}
                    onClick={() => saveKeywords(keywords.filter(k => k !== keyword))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form className="add" onSubmit={handleAdd}>
              <input
                type="text"
                value={newKeyword}
                maxLength={20}
                placeholder="例如：德州、打牌"
                onChange={(e) => setNewKeyword(e.target.value)}
              />
              <button type="submit" disabled={saving || !newKeyword.trim()}>新增</button>
            </form>
            {error && <p className="error">{error}</p>}
          </div>
        </section>
      </main>
    </Container>
  </> )
};

const Container = styled.div`
  min-height: 100vh;
  background: ${COLORS.ground};
  color: ${COLORS.text};
  font-family: -apple-system, "PingFang TC", "Noto Sans TC", sans-serif;

  main {
    padding: 14px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-width: 640px;
    margin: 0 auto;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .group-title {
    font-size: 13px;
    font-weight: 700;
    color: ${COLORS.label};
    padding-left: 4px;
  }

  .list {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px 14px;

    & + .item {
      border-top: 1px solid ${COLORS.line};
    }
  }

  .item-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-label {
    font-size: 16px;
    font-weight: 600;
  }

  .item-sub {
    font-size: 12px;
    color: ${COLORS.muted};
  }

  .chevron {
    font-size: 22px;
    color: ${COLORS.muted};
  }

  .keywords {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    height: 34px;
    padding: 0 4px 0 12px;
    border-radius: 999px;
    background: ${COLORS.felt};
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 14px;
    font-weight: 600;

    button {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: #fff;
      font-size: 18px;

      &:disabled {
        opacity: 0.3;
      }
    }
  }

  .add {
    display: flex;
    gap: 8px;

    input {
      flex: 1;
      min-width: 0;
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

    button {
      width: 72px;
      border-radius: 8px;
      border: 0;
      background: ${COLORS.felt};
      color: #fff;
      font-size: 15px;
      font-weight: 700;

      &:disabled {
        opacity: 0.4;
      }
    }
  }

  .error {
    font-size: 13px;
    color: ${COLORS.lose};
  }
`;

export default SettingsPage;
