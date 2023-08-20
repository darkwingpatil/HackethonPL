import React from "react";
import "./App.css";

import Chatbot from "./components/chatbot";
import { CodeLabList } from "./screens/CodeLabList";
import { CodeLab } from "./components/DetailPage/DetailPage"
//import ChatbotNew from "./components/chatbot-new";
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <div className="App">
      {/* <Chatbot /> */}
      <Routes>
        <Route path={"/"} element={<CodeLabList />}></Route>
        <Route path={"/detail_page/:courseId/:userHandle/:title"} element={<CodeLab />}></Route>
      </Routes>
    </div>
  );
}

export default App;
