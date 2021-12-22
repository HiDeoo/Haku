import Sidebar from 'components/Sidebar'

const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-zinc-800 text-blue-50 text-sm">
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}

export default Layout
