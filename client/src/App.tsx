import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboard";
import Titre from "./components/Titre";

function App() {
  return (
    <div className="App">
      <Titre />
      <Dashboard />
    </div>
  );
}

export default App;
