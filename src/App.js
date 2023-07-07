import logo from "./logo.svg";
import "./App.css";
import Header from "./Components/header.jsx";
import Hero from "./Components/Hero";
import Container from "./Components/container";
import CombinedComponent from "./Components/CombinedComponent";
function App() {
  return (
    <div>
      <Header />
      {/* <Hero /> */}
      <CombinedComponent />
      {/* <Container /> */}
    </div>
  );
}

export default App;
