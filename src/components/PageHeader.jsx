import styled from "styled-components"

export const COLORS = {
  felt: "#16423C",
  feltSub: "#B9D3C8",
  ground: "#F3F5F4",
  text: "#1A1F1D",
  label: "#4A544F",
  muted: "#6B746F",
  border: "#D5DCD8",
  line: "#EEF0EF",
  win: "#1C6B4C",
  winBar: "#2F8A63",
  winBg: "#E1F0E8",
  lose: "#B23A26",
  loseBg: "#FBEFEC",
  feeBg: "#F5F1E8",
  feeBorder: "#C9BC9C",
  feeText: "#4A4335",
  feeSub: "#6B5F45",
}

const PageHeader = ({ subtitle, title, children }) => (
  <Header>
    <div className="titles">
      {subtitle && <div className="subtitle">{subtitle}</div>}
      <h1>{title}</h1>
    </div>
    {children}
  </Header>
)

const Header = styled.header`
  background: ${COLORS.felt};
  color: #fff;
  padding: 16px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .subtitle {
    font-size: 12px;
    color: ${COLORS.feltSub};
  }

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
  }
`

export default PageHeader
