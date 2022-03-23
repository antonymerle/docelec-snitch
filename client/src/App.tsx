import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboard";
import Titre from "./components/Titre";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="App">
      <Titre />
      <Dashboard />
      <Footer />
    </div>
  );
}

export default App;
