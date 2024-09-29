import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import useSWR from 'swr';
import LoadingSkeleton from '@/components/LoadingSkeleton';

function GamesTableContainer({ room_id }) {
  const { data: games, isLoading } = useSWR(`/api/rooms/${room_id}/games`)

  if (isLoading) return <LoadingSkeleton />

  const { headers, rows } = games

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '90vh' }}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            {headers.map((header) => (
              <TableCell key={header.id}>
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
            <TableRow>
            <TableCell><b>Total Score</b></TableCell>
            {headers.map((header) => (
              <TableCell key={header.id}>
                <strong>{header.totalScore}</strong>
              </TableCell>
            ))}
            </TableRow>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.Date}</TableCell>
              {headers.map((header) => (
                <TableCell key={header.id}>{row[header.id] !== '' ? row[header.id] : '-'}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default GamesTableContainer;
