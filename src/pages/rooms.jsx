import { useState } from "react"
import useSWR from "swr"
import { Table, TableHead, TableRow, TableCell, TableBody, TextField, Select, MenuItem } from "@mui/material"

export default function RoomsPage() {
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const { data } = useSWR(`/api/rooms?page=${page}&per_page=${perPage}`)

  return (
    <div>
      <h1>Rooms</h1>
      <div>
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
    </div>
  )
}