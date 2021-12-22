import Sidebar from 'components/Sidebar'

const Layout: React.FC<Props> = ({ children, sidebar }) => {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-zinc-800 text-blue-50 text-sm">
      {sidebar ? <Sidebar /> : null}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}

export default Layout

interface Props {
  sidebar: boolean
}
