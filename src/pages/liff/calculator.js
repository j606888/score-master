"use client";

import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import styled from "styled-components";
import { Button } from "@mui/material";
import Link from "next/link";
const PokerCalculator = () => {
  const [defaultMoney, setDefaultMoney] = useState(2000);
  const [thousand, setThousand] = useState('');
  const [fiveHundred, setFiveHundred] = useState('');
  const [hundred, setHundred] = useState('');
  const [fifty, setFifty] = useState('');
  const [ten, setTen] = useState('');
  const [rebuy, setRebuy] = useState('');
  const [winLoseAmount, setWinLoseAmount] = useState(0);
  const [from, setFrom] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    setFrom(from);
  }, []);

  console.log(from);

  useEffect(() => {
    const calculatedTotal =
      (thousand || 0) * 1000 +
      (fiveHundred || 0) * 500 +
      (hundred || 0) * 100 +
      (fifty || 0) * 50 +
      (ten || 0) * 10 +
      (rebuy || 0) * -defaultMoney;

    setWinLoseAmount((calculatedTotal - defaultMoney) / 2);
  }, [defaultMoney, thousand, fiveHundred, hundred, fifty, ten, rebuy]);

  const handleReset = () => {
    setDefaultMoney(2000);
    setThousand('');
    setFiveHundred('');
    setHundred('');
    setFifty('');
    setTen('');
    setRebuy('');
  }

  return (
    <Container>
      <div className="title">籌碼計算機
        {from && (
          <span className="back-to-game">
            <Link href={from}>返回</Link>
          </span>
        )}
      </div>
      <div className="content">
        <div className="space-y-2">
          <label htmlFor="defaultMoney">本金(含東)</label>
          <TextField
            fullWidth
            size="small"
            id="defaultMoney"
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={defaultMoney}
            onChange={(e) => setDefaultMoney(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="thousand">1000</label>
          <TextField
            fullWidth
            size="small"
            id="thousand"
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={thousand}
            onChange={(e) => setThousand(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="fiveHundred">500</label>
          <TextField
            fullWidth
            size="small"
            id="fiveHundred"
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={fiveHundred}
            onChange={(e) => setFiveHundred(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="hundred">100</label>
          <TextField
            fullWidth
            size="small"
            id="hundred"
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={hundred}
            onChange={(e) => setHundred(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="fifty">50</label>
          <TextField
            fullWidth
            size="small"
            id="fifty"
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={fifty}
            onChange={(e) => setFifty(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="ten">10</label>
          <TextField
            fullWidth
            size="small"
            id="ten"
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={ten}
            onChange={(e) => setTen(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="rebuy">Rebuy次數</label>
          <TextField
            fullWidth
            size="small"
            id="rebuy"
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={rebuy}
            onChange={(e) => setRebuy(Number(e.target.value))}
          />
        </div>
        <div className="result">
          <p
            className={`text-lg font-semibold ${
              winLoseAmount >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {winLoseAmount >= 0 ? "Win" : "Lose"} Amount: $
            {Math.abs(winLoseAmount).toLocaleString()}
          </p>
          <Button size='small' variant="contained" color="primary" onClick={handleReset}>Reset</Button>
        </div>
      </div>
    </Container>
  );
};

const Container = styled.div`
  padding: 32px 64px;

  .back-to-game {
    font-size: 12px;
    background-color: #1976d2;
    color: #fff;
    padding: 4px 12px;
    border-radius: 12px;
    margin-left: 12px;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #1565c0;
    }
  }

  .title {
    margin: 0 auto 12px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    font-size: 24px;
    font-weight: bold;
  }

  label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
    font-size: 14px;
  }

  .result {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .space-y-2 {
    margin-bottom: 12px;
  }

  .pt-4 {
    padding-top: 12px;
  }

  .text-lg {
    font-size: 18px;
  }

  .font-semibold {
    font-weight: 600;
  }

  .text-green-600 {
    color: #16a34a;
  }

  .text-red-600 {
    color: #ef4444;
  }
`;

export default PokerCalculator;
