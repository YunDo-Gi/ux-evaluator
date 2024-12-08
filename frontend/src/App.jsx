import './App.css'
import useTracking from './hooks/useTracking'

function App() {
  const trackingData = useTracking();

  const handleTaskComplete = () => {
    // trackingData는 이제 서버로 전송 가능한 형태
    console.log('Collected data:', trackingData);
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleTaskComplete}>
          end
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
