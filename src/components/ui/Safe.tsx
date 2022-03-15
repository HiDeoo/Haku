const Safe: React.FC = ({ children }) => {
  return (
    <div className="overflow-y-auto supports-max:pr-[max(0px,env(safe-area-inset-right))] supports-max:pb-[max(0px,env(safe-area-inset-bottom))]">
      {children}
    </div>
  )
}

export default Safe
