import { useState } from "react"
import useSWR from "swr"
import { Table, TableHead, TableRow, TableCell, TableBody, TextField, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material"
import styled from "styled-components"

export default function RoomsPage() {
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [skipEmpty, setSkipEmpty] = useState(false)
  const { data } = useSWR(`/api/rooms?page=${page}&per_page=${perPage}${skipEmpty ? '&skip_empty=true' : ''}`)

  return (
    <Container>
      <h1>所有房間</h1>
      <div className="filters">
        <TextField
          type="number"
          label="Page"
          value={page}
          onChange={(e) => setPage(Number(e.target.value))}
        />
        <Select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
        <FormControlLabel
          control={<Checkbox checked={skipEmpty} onChange={(e) => setSkipEmpty(e.target.checked)} />}
          label="不顯示空房"
        />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Players Count</TableCell>
            <TableCell>Games Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((room) => (
            <TableRow key={room.id} sx={{ hover: { cursor: 'pointer', backgroundColor: 'lightgray' } }}>
              <TableCell>{room.id}</TableCell>
              <TableCell>
                <a href={`/liff/rooms/${room.id}/games`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {room.name}
                </a>
              </TableCell>
              <TableCell>{room.playersCount}</TableCell>
              <TableCell>{room.gamesCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  )
}

const Container = styled.div`
  padding: 20px;
  .filters {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
`