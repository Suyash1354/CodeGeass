import FirstScene from './scenes/FirstScene'
import SecondScene from './scenes/SecondScene'

const App = () => {
  return (
    <main className='w-full'>
      {/* Height gives scroll room for FirstScene (1900px) + SecondScene */}
      <div style={{ height: "4800px" }} />
      <FirstScene />
      <SecondScene />
    </main>
  )
}

export default App