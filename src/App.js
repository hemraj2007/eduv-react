// import logo from './logo.svg';
import './styles/global-styles.css';
import './App.css';
import './style.css';

// Preload admin styles to prevent styling issues
import './styles/admin-styles.css';

import Routes from './routes/index'
function App() {
  return (
    <div className="App">
      <Routes/>
    </div>
  );
}

export default App;
