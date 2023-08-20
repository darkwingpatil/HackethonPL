import React from "react";
//import { Copy } from "./Copy";
//import { FullscreenWrapper } from "./FullscreenWrapper";
import "./style.css";
import {useParams} from "react-router-dom"
import Chatbot from "../chatbot";

export const CodeLab = () => {
  //courseId/:userHandle/:title
  const {courseId,userHandle,title}=useParams()
  return (
    <div className="code-lab">
      <div className="div">
        <p className="building">{title}</p>
        <div className="text-wrapper">Code Labs</div>
        <div className="overlap">
          <div className="rectangle" />
          <div className="rectangle-2" />
          <div className="text-wrapper-2">Steps</div>
          <div className="text-wrapper-3">Settings</div>
          <div className="text-wrapper-4">Code</div>
          <div className="rectangle-3" />
          <div className="rectangle-4" />
          <p className="the-start-state-of">
            The start state of each module is located in the numbered directory. To work on these demos:
            <br />
            <br />
            Open the root directory of the demo in the terminal. This is usually where the package.json file is. e.g. 05
            <br />
            <br />
            In this directory run npm start (Node.js, npm and all dependencies are already installed.)
            <br />
            <br />
            To run the module solution follow the steps above in the appropriate directory e.g. solutions/05.
          </p>
        </div>
        <div className="text-wrapper-5">PS Tutor</div>

        <div className="text-wrapper-11">AI-Powered learning mentor</div>
        <img className="chatbot" alt="Chatbot" src="chatbot.svg" />
        <Chatbot props={{courseId,userHandle,title}}/>
      </div>
    </div>
  );
};
