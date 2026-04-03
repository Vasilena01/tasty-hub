import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Recipe Hub</h1>
        <p>Full-Stack Recipe Sharing Application</p>
        <p>Backend API: {process.env.REACT_APP_API_URL}</p>
      </header>
    </div>
  );
}

export default App;
