import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>

      <div className="top-bar">

        <h1 className="title">NBA.Tools</h1>
        <button className="login-button">Login</button>

      </div>

      <div style={{ padding: "20px" }}>
        
        <button onClick={() => setCount(count + 1)}>count is {count}</button>

      </div>

    </>

  );
}

export default App;
