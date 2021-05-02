import { useState } from "react";
import "./App.css";
import Login from "./components/login";

function App({ signalApp }) {
  const [login, setLogin] = useState(false);
  const btnClick = () => {
    console.log("click");
    setLogin(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        {!login && <Login onBtnClick={btnClick}></Login>}
        {login && Object.keys(signalApp.participants)}
      </header>
    </div>
  );
}

export default App;
