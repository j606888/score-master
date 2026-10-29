import styled from "styled-components";
import { COLORS } from "@/components/PageHeader";

const ScoreRow = ({ name, entry, fee = false, onSign, onAmount, onFocus, onBlur }) => {
  const sign = entry?.sign ?? null;
  const amount = entry?.amount ?? "";
  const amountColor = fee ? COLORS.feeText : sign === 1 ? COLORS.win : sign === -1 ? COLORS.lose : COLORS.text;

  return (
    <Row className={fee ? "fee" : ""}>
      <div className="name">
        <span>{name}</span>
        {fee && <span className="sub">場地費 · 只收不輸，不列入排行</span>}
      </div>
      {fee ? (
        <span className="plus" aria-hidden="true">+</span>
      ) : (
        <div className="toggle" role="group" aria-label={`${name} 輸贏`}>
          <button type="button" className={sign === 1 ? "win" : ""} aria-pressed={sign === 1} onClick={() => onSign(1)}>贏</button>
          <button type="button" className={sign === -1 ? "lose" : ""} aria-pressed={sign === -1} onClick={() => onSign(-1)}>輸</button>
        </div>
      )}
      <label className="amount">
        <span className="sr-only">{name} {fee ? "場地費金額" : "金額"}</span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={fee ? "0" : "—"}
          value={amount}
          style={{ color: amountColor }}
          onChange={(e) => onAmount(e.target.value.replace(/\D/g, ""))}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </label>
    </Row>
  );
};

const Row = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 8px 10px 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  .name {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    font-weight: 600;

    span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .sub {
    font-size: 12px;
    font-weight: 400;
    color: ${COLORS.feeSub};
  }

  .toggle {
    display: flex;
    border-radius: 8px;
    background: #eef1ef;
    padding: 3px;

    button {
      width: 40px;
      height: 38px;
      border: 0;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      background: transparent;
      color: ${COLORS.label};
    }

    .win {
      background: ${COLORS.win};
      color: #fff;
    }

    .lose {
      background: ${COLORS.lose};
      color: #fff;
    }
  }

  .plus {
    font-size: 18px;
    font-weight: 800;
    color: ${COLORS.feeSub};
  }

  .amount {
    width: 92px;
    height: 44px;
    border-radius: 8px;
    border: 1px solid ${COLORS.border};
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 10px;

    input {
      width: 100%;
      border: 0;
      outline: 0;
      font-size: 17px;
      font-weight: 700;
      text-align: right;
      font-variant-numeric: tabular-nums;
      background: transparent;
    }

    &:focus-within {
      border-color: ${COLORS.felt};
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  &.fee {
    background: ${COLORS.feeBg};
    border: 1px dashed ${COLORS.feeBorder};

    .name > span:first-child {
      color: ${COLORS.feeText};
    }

    .amount {
      border-color: ${COLORS.feeBorder};
    }
  }
`;

export default ScoreRow;
