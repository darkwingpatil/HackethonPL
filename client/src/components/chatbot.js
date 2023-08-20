import React, { useState, useEffect } from "react";
import {
  unsafe_Input as Input,
  unsafe_FormControlProvider as FormControlProvider,
} from "@pluralsight/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { io } from "socket.io-client";

import { ProfileSkeleton } from "./ProfileSkeleton";
import logo from "./chatlogo.png";
import search_active from "./search_active.png";
import search from "./submit.svg";
import labBackground from "./labBackground.png";
import thumpsup from "./icons8-thumbs-up.png"
import thumpsupclicked from "./icons8-thumbs-up-clicked.png"
import thumpsdown from "./icons8-thumbs-down.png"
import thumpsdownclicked from "./icons8-thumbs-down-clicked.png"
import copy from "./icons8-copy.png"
import { v4 as uuidv4 } from "uuid";
import "./chatbot.css";
import "../App.css";
import _ from "lodash";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// Import the necessary language syntax
import {
  jsx,
  python,
  java,
} from "react-syntax-highlighter/dist/esm/languages/prism";

SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);

// note this is for local test purpose
//const userHandle = "a48c4f3a-9a5e-4709-a438-4430f8c98e24"
const sessionId = uuidv4();
//const courseId = "133ddf17-a77d-4118-b79e-e8bb6ed1d674"




function Chatbot({props}) {

  console.log(props,"in chatbottttt")
  let {userHandle,courseId,title}=props
  const [isOpen, setIsOpen] = useState(true);
  const [moreoption, setmoreoption] = useState(false)
  const [isFetchingResponse, setIsFetchingResponse] = React.useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [calledHistoryapi, setCalledHistoryapi] = useState([]);
  const [showHistory, setShowHistory] = useState(false)
  const [lastResponse, setLastResponse] = useState("");
  const [backContexttitle, setBackContextTitle] = useState(null)
  const [thumbsup, setTumpsup] = useState({})
  const [thumbsdown, setTumpsdown] = useState({})

  const freqAskQuestions = [
    "Hey there, it’s great to see you! 👋",
    `Ask me anything related to your lab on ${title}`,
  ];
  //note this api should be hit when from listingpage we are entering into detail page
  // POST localhost:4000/settingContextPromptData
  //With body which would be dynamic {"courseId":"133ddf17-a77d-4118-b79e-e8bb6ed1d674","userHandle":"a48c4f3a-9a5e-4709-a438-4430f8c98e24"}


  var socket = io("http://localhost:4000", { transports: ["websocket"] });
  let previousDays = 0;
  let currentDay = 0;
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket!");
    });

    socket.on("error", () => {
      console.log("Error!");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected", socket.id);
    });

    socket.on("queryResponse", ({ response }) => {
      console.log(response);
      setIsFetchingResponse(false);
      setLastResponse(response);
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off("connect");
      socket.off("error");
      //socket.disconnect();
    };
  }, []);

  const get_user_chat_history = () => {
    fetch(`http://localhost:4000/entireConversation?userHandle=${userHandle}`)
      .then((res) => res.json())
      .then(({ data }) => {
        setCalledHistoryapi(data)
        // console.log(data, "history data")
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    const processResponse = (response) => {
      if (chatHistory.length > 0) {
        const lastChat = _.last(chatHistory);
        const lastChatIndex = chatHistory.length - 1;
        chatHistory[lastChatIndex] = {
          ...lastChat,
          response,
        };

        // console.log(chatHistory, "this is chathistory")

        setChatHistory(chatHistory);
        setLastResponse("");
      }
    };

    if (lastResponse) processResponse(lastResponse);
  }, [lastResponse, chatHistory]);

  const fetchMoreData = () => { };

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };


  const thumbupHandler = (index, userHandle, sessionId, courseId) => {
    if (thumbsup[`${index}${userHandle}${sessionId}${courseId}`]) {
      const updatedThumbsup = { ...thumbsup };
      delete updatedThumbsup[`${index}${userHandle}${sessionId}${courseId}`]
      setTumpsup(updatedThumbsup)
    }
    else {
      fetch("http://localhost:4000/updatefeedback", {
        'method': "POST",
        'headers': {
          "Content-Type": "application/json"
        },
        'body': JSON.stringify({ userHandle, sessionId, courseId, message_index: index, feedback: true })
      })
        .then((res) => res)
        .catch((err) => console.log(err))
      setTumpsup({ ...thumbsup, [`${index}${userHandle}${sessionId}${courseId}`]: 1 })
    }
  }

  const thumbdownHandler = (index, userHandle, sessionId, courseId) => {
    if (thumbsdown[`${index}${userHandle}${sessionId}${courseId}`]) {
      const updatedThumbsdown = { ...thumbsdown };
      delete updatedThumbsdown[`${index}${userHandle}${sessionId}${courseId}`]
      setTumpsdown(updatedThumbsdown)
    }
    else {
      //userHandle,sessionId,courseId,message_index,feedback
      fetch("http://localhost:8080/updatefeedback", {
        'method': "POST",
        'headers': {
          "Content-Type": "application/json"
        },
        'body': JSON.stringify({ userHandle, sessionId, courseId, message_index: index, feedback: false })
      })
        .then((res) => res)
        .catch((err) => console.log(err))
      setTumpsdown({ ...thumbsdown, [`${index}${userHandle}${sessionId}${courseId}`]: 1 })
    }
  }

  const handleSubmit = () => {
    if (isFetchingResponse) return;
    const chatHistoryCopy = _.cloneDeep(chatHistory);
    chatHistoryCopy.push({
      query: inputValue,
      response: "",
    });

    setChatHistory(chatHistoryCopy);

    setIsFetchingResponse(true);
    socket.emit("userQuery", {
      query: inputValue,
      courseId: courseId,
      sessionId,
      userHandle,
    });
    setInputValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const CodeBlock = ({ code }) => {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  };

  const TextWithCodeBlocks = ({ text }) => {
    console.log(text, "Ssasa")
    const codeRegex = /```([\s\S]*?)```/g;
    const codeBlocks = text.split(codeRegex);

    return (
      <div style={{ whiteSpace: "pre-wrap" }}>
        {codeBlocks.map((block, index) => {
          if (index % 2 === 0) {
            return <p key={index}>{block}</p>;
          } else {
            return (
              <SyntaxHighlighter
                language="auto"
                style={vscDarkPlus}
                className="code-textor"
              >
                {block}
              </SyntaxHighlighter>
            );
          }
        })}
      </div>
    );
  };

  //console.log(chatHistory);

  return (
    <div className="App">
      {/* <img src={labBackground} alt="Lab Background" /> */}
      <div id="chatbot-container">
        <div id="chatbot-icon" onClick={toggleChatbox}>
          <img src={logo} alt="Chatbot Icon" />
        </div>
      </div>
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <div className="chatbox-header-icon">
              {/* Insert your icon component here */}
              <img className="chatbox-header-image" src={logo} />
              <div className="formatingtitle">
                <span
                  style={{ display: "flex", justifyContent: "start" }}
                  className="chatbox-header-username"
                >
                  Scout
                </span>
                <p
                  style={{
                    fontSize: "8px",
                    display: "flex",
                    justifyContent: "start",
                    marginLeft: "7%",
                  }}
                >
                  Powered by ChatGPT
                </p>
              </div>
            </div>
            <div className="chatbox-side-options">
              <div class="chatbox-header-option-icon" onClick={() => setmoreoption(!moreoption)}>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <div
                className="chatbox-header-close-icon"
                onClick={() => {
                  setIsOpen(false);
                  fetch(`http://localhost:4000/oncloseaddtohistory?userHandle=${userHandle}&courseId=${courseId}`)
                    .then((res) => res.json())
                    .catch((err) => console.log(err))
                }}
              >
                {/* Insert your close icon component here */}
                &#x2715;
              </div>
            </div>

          </div>
          {
            moreoption ?
              <div className="more-option-box">
                <svg onClick={() => {
                  setChatHistory([])
                  setShowHistory(false)
                  setBackContextTitle(null)
                  setmoreoption(false)
                }} width="192" height="24" viewBox="0 0 192 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M31.417 12.8334H26.8337V17.4167C26.8337 17.6468 26.6471 17.8334 26.417 17.8334H25.5837C25.3535 17.8334 25.167 17.6468 25.167 17.4167V12.8334H20.5837C20.3535 12.8334 20.167 12.6468 20.167 12.4167V11.5834C20.167 11.3532 20.3535 11.1667 20.5837 11.1667H25.167V6.58335C25.167 6.35324 25.3535 6.16669 25.5837 6.16669H26.417C26.6471 6.16669 26.8337 6.35324 26.8337 6.58335V11.1667H31.417C31.6471 11.1667 31.8337 11.3532 31.8337 11.5834V12.4167C31.8337 12.6468 31.6471 12.8334 31.417 12.8334Z" fill="#2A2753" />
                  <path d="M48.046 17.084C45.946 17.084 44.644 15.782 44.644 14.004H45.946C45.946 15.222 46.674 15.95 48.046 15.95C49.418 15.95 50.146 15.222 50.146 14.326C50.146 11.82 44.728 13.122 44.728 9.482C44.728 8.11 46.1 6.738 48.046 6.738C49.824 6.738 51.196 8.11 51.196 9.804H49.908C49.908 8.67 49.096 7.858 48.046 7.858C46.828 7.858 46.016 8.67 46.016 9.482C46.016 11.988 51.434 10.7 51.434 14.326C51.434 15.782 50.146 17.084 48.046 17.084ZM55.8757 17.084C54.7417 17.084 53.7617 16.104 53.7617 14.662V10.854H52.4737V9.72H53.0477C53.6077 9.72 53.9297 9.398 53.9297 8.838V7.788H54.9797V9.72H56.6037V10.854H54.9797V14.662C54.9797 15.46 55.4697 15.95 56.1977 15.95C56.4357 15.95 56.6037 15.866 56.6037 15.866V16.916C56.6037 16.916 56.3517 17.084 55.8757 17.084ZM60.4593 17.084C59.0033 17.084 58.0373 16.104 58.0373 14.9C58.0373 13.528 59.0033 12.548 62.6433 12.548V12.156C62.6433 11.428 61.9993 10.77 61.1033 10.77C60.2213 10.77 59.8153 11.176 59.6473 11.82H58.3593C58.5273 10.616 59.4933 9.636 61.1033 9.636C62.7273 9.636 63.8613 10.77 63.8613 12.156V17H62.9653L62.6433 16.188C62.6433 16.188 61.9153 17.084 60.4593 17.084ZM60.4593 15.95C61.7613 15.95 62.6433 15.054 62.6433 14.256V13.682C59.7313 13.682 59.2553 14.172 59.2553 14.984C59.2553 15.46 59.7313 15.95 60.4593 15.95ZM66.0188 17V9.72H66.9148L67.2368 10.532C67.2368 10.532 67.9648 9.636 69.3368 9.636H69.4908V10.854H69.1688C68.0348 10.854 67.2368 11.666 67.2368 12.87V17H66.0188ZM73.6727 17.084C72.5387 17.084 71.5587 16.104 71.5587 14.662V10.854H70.2707V9.72H70.8447C71.4047 9.72 71.7267 9.398 71.7267 8.838V7.788H72.7767V9.72H74.4007V10.854H72.7767V14.662C72.7767 15.46 73.2667 15.95 73.9947 15.95C74.2327 15.95 74.4007 15.866 74.4007 15.866V16.916C74.4007 16.916 74.1487 17.084 73.6727 17.084ZM79.933 17V9.72H80.829L81.151 10.532C81.151 10.532 81.879 9.636 83.251 9.636C84.791 9.636 86.079 10.938 86.079 12.8V17H84.861V12.8C84.861 11.582 84.063 10.77 83.083 10.77C81.949 10.77 81.151 11.582 81.151 12.8V17H79.933ZM91.2311 17.084C89.2851 17.084 87.7451 15.544 87.7451 13.36C87.7451 11.176 89.3691 9.636 91.1471 9.636C92.9251 9.636 94.4651 11.092 94.4651 13.276C94.4651 13.682 94.3811 13.934 94.3811 13.934H89.0471C89.1311 14.984 90.0971 15.95 91.2311 15.95C92.1971 15.95 92.7571 15.39 93.0091 15.054H94.2971C93.8211 16.104 92.8411 17.084 91.2311 17.084ZM89.0471 12.87H93.2471C93.0931 11.666 92.1971 10.77 91.1471 10.77C90.0971 10.77 89.2011 11.666 89.0471 12.87ZM97.7491 17L95.3271 9.72H96.6151L98.3091 14.9L99.9331 9.72H100.731L102.355 14.9L104.049 9.72H105.351L102.915 17H101.949L100.339 11.82L98.7151 17H97.7491ZM113.223 17.084C111.361 17.084 109.821 15.544 109.821 13.36C109.821 11.176 111.361 9.636 113.223 9.636C114.833 9.636 116.051 10.854 116.373 12.31H115.169C114.917 11.498 114.189 10.77 113.223 10.77C112.089 10.77 111.039 11.82 111.039 13.36C111.039 14.9 112.089 15.95 113.223 15.95C114.189 15.95 114.917 15.222 115.169 14.41H116.373C116.051 15.866 114.833 17.084 113.223 17.084ZM118.137 17V6.808H119.341V10.616C119.341 10.616 120.069 9.636 121.455 9.636C122.981 9.636 124.283 10.938 124.283 12.8V17H123.065V12.8C123.065 11.582 122.253 10.77 121.287 10.77C120.153 10.77 119.341 11.582 119.341 12.8V17H118.137ZM128.537 17.084C127.081 17.084 126.115 16.104 126.115 14.9C126.115 13.528 127.081 12.548 130.721 12.548V12.156C130.721 11.428 130.077 10.77 129.181 10.77C128.299 10.77 127.893 11.176 127.725 11.82H126.437C126.605 10.616 127.571 9.636 129.181 9.636C130.805 9.636 131.939 10.77 131.939 12.156V17H131.043L130.721 16.188C130.721 16.188 129.993 17.084 128.537 17.084ZM128.537 15.95C129.839 15.95 130.721 15.054 130.721 14.256V13.682C127.809 13.682 127.333 14.172 127.333 14.984C127.333 15.46 127.809 15.95 128.537 15.95ZM136.606 17.084C135.472 17.084 134.492 16.104 134.492 14.662V10.854H133.204V9.72H133.778C134.338 9.72 134.66 9.398 134.66 8.838V7.788H135.71V9.72H137.334V10.854H135.71V14.662C135.71 15.46 136.2 15.95 136.928 15.95C137.167 15.95 137.334 15.866 137.334 15.866V16.916C137.334 16.916 137.082 17.084 136.606 17.084Z" fill="#1A2737" />
                </svg>
                {
                  !showHistory && backContexttitle == null ?
                    <svg onClick={() => {
                      get_user_chat_history()
                      setShowHistory(true)
                      setmoreoption(false)
                    }} width="192" height="36" viewBox="0 0 192 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.8923 20.352C20.3577 22.7403 22.993 24.3333 26.0003 24.3333C30.6027 24.3333 34.3337 20.6023 34.3337 16C34.3337 11.3976 30.6027 7.66663 26.0003 7.66663C23.2741 7.66663 20.8537 8.97573 19.3333 10.9996L18.3783 10.0446C18.1158 9.7821 17.667 9.96801 17.667 10.3392V13.9166C17.667 14.1467 17.8535 14.3333 18.0837 14.3333H21.6611C22.0323 14.3333 22.2182 13.8845 21.9557 13.622L20.5268 12.1931C21.7313 10.4645 23.7337 9.33329 26.0003 9.33329C29.6822 9.33329 32.667 12.3181 32.667 16C32.667 19.6819 29.6822 22.6666 26.0003 22.6666C23.624 22.6666 21.5381 21.4233 20.3576 19.5518C20.2349 19.3573 19.983 19.2822 19.7811 19.3923L19.0493 19.7915C18.8471 19.9017 18.7719 20.1558 18.8923 20.352Z" fill="#2A2753" />
                      <path d="M25.5945 11.8327H26.4278C26.6579 11.8327 26.8445 12.0193 26.8445 12.2494V15.6481L29.2608 18.0644C29.4235 18.2271 29.4235 18.491 29.2608 18.6537L28.6716 19.2429C28.5089 19.4056 28.245 19.4056 28.0823 19.2429L25.1778 16.3384V12.2494C25.1778 12.0193 25.3644 11.8327 25.5945 11.8327Z" fill="#2A2753" />
                      <path d="M45.288 21V10.808H49.096C50.79 10.808 52.162 12.194 52.162 13.804C52.162 16.156 49.922 16.716 49.922 16.716L52.414 21H50.958L48.522 16.8H46.59V21H45.288ZM46.59 15.666H49.096C50.062 15.666 50.874 14.854 50.874 13.804C50.874 12.754 50.062 11.942 49.096 11.942H46.59V15.666ZM57.1548 21.084C55.2088 21.084 53.6688 19.544 53.6688 17.36C53.6688 15.176 55.2928 13.636 57.0708 13.636C58.8488 13.636 60.3888 15.092 60.3888 17.276C60.3888 17.682 60.3048 17.934 60.3048 17.934H54.9708C55.0548 18.984 56.0208 19.95 57.1548 19.95C58.1208 19.95 58.6808 19.39 58.9328 19.054H60.2208C59.7448 20.104 58.7648 21.084 57.1548 21.084ZM54.9708 16.87H59.1708C59.0168 15.666 58.1208 14.77 57.0708 14.77C56.0208 14.77 55.1248 15.666 54.9708 16.87ZM65.0447 21.084C63.1827 21.084 61.6427 19.544 61.6427 17.36C61.6427 15.176 63.1827 13.636 65.0447 13.636C66.6547 13.636 67.8727 14.854 68.1947 16.31H66.9907C66.7387 15.498 66.0107 14.77 65.0447 14.77C63.9107 14.77 62.8607 15.82 62.8607 17.36C62.8607 18.9 63.9107 19.95 65.0447 19.95C66.0107 19.95 66.7387 19.222 66.9907 18.41H68.1947C67.8727 19.866 66.6547 21.084 65.0447 21.084ZM72.8703 21.084C70.9243 21.084 69.3843 19.544 69.3843 17.36C69.3843 15.176 71.0083 13.636 72.7863 13.636C74.5643 13.636 76.1043 15.092 76.1043 17.276C76.1043 17.682 76.0203 17.934 76.0203 17.934H70.6863C70.7703 18.984 71.7363 19.95 72.8703 19.95C73.8363 19.95 74.3963 19.39 74.6483 19.054H75.9363C75.4603 20.104 74.4803 21.084 72.8703 21.084ZM70.6863 16.87H74.8863C74.7323 15.666 73.8363 14.77 72.7863 14.77C71.7363 14.77 70.8403 15.666 70.6863 16.87ZM77.8483 21V13.72H78.7443L79.0663 14.532C79.0663 14.532 79.7943 13.636 81.1663 13.636C82.7063 13.636 83.9943 14.938 83.9943 16.8V21H82.7763V16.8C82.7763 15.582 81.9783 14.77 80.9983 14.77C79.8643 14.77 79.0663 15.582 79.0663 16.8V21H77.8483ZM88.8244 21.084C87.6904 21.084 86.7104 20.104 86.7104 18.662V14.854H85.4224V13.72H85.9964C86.5564 13.72 86.8784 13.398 86.8784 12.838V11.788H87.9284V13.72H89.5524V14.854H87.9284V18.662C87.9284 19.46 88.4184 19.95 89.1464 19.95C89.3844 19.95 89.5524 19.866 89.5524 19.866V20.916C89.5524 20.916 89.3004 21.084 88.8244 21.084ZM95.1687 21V10.808H96.3727V14.616C96.3727 14.616 97.1007 13.636 98.4867 13.636C100.013 13.636 101.315 14.938 101.315 16.8V21H100.097V16.8C100.097 15.582 99.2847 14.77 98.3187 14.77C97.1847 14.77 96.3727 15.582 96.3727 16.8V21H95.1687ZM103.469 21V13.72H104.687V21H103.469ZM104.071 12.432C103.637 12.432 103.315 12.11 103.315 11.676C103.315 11.214 103.637 10.892 104.071 10.892C104.519 10.892 104.841 11.214 104.841 11.676C104.841 12.11 104.519 12.432 104.071 12.432ZM109.115 21.084C107.491 21.084 106.525 20.104 106.441 18.816H107.659C107.743 19.46 108.219 19.95 109.115 19.95C109.927 19.95 110.403 19.46 110.403 18.9C110.403 17.276 106.609 18.494 106.609 15.75C106.609 14.616 107.575 13.636 109.031 13.636C110.571 13.636 111.453 14.532 111.537 15.82H110.333C110.249 15.176 109.843 14.77 109.031 14.77C108.303 14.77 107.827 15.26 107.827 15.75C107.827 17.36 111.621 16.156 111.621 18.9C111.621 20.104 110.655 21.084 109.115 21.084ZM116.13 21.084C114.996 21.084 114.016 20.104 114.016 18.662V14.854H112.728V13.72H113.302C113.862 13.72 114.184 13.398 114.184 12.838V11.788H115.234V13.72H116.858V14.854H115.234V18.662C115.234 19.46 115.724 19.95 116.452 19.95C116.69 19.95 116.858 19.866 116.858 19.866V20.916C116.858 20.916 116.606 21.084 116.13 21.084ZM121.525 21.084C119.663 21.084 118.123 19.544 118.123 17.36C118.123 15.176 119.663 13.636 121.525 13.636C123.387 13.636 124.927 15.176 124.927 17.36C124.927 19.544 123.387 21.084 121.525 21.084ZM121.525 19.95C122.659 19.95 123.709 18.9 123.709 17.36C123.709 15.82 122.659 14.77 121.525 14.77C120.391 14.77 119.341 15.82 119.341 17.36C119.341 18.9 120.391 19.95 121.525 19.95ZM126.683 21V13.72H127.579L127.901 14.532C127.901 14.532 128.629 13.636 130.001 13.636H130.155V14.854H129.833C128.699 14.854 127.901 15.666 127.901 16.87V21H126.683ZM132.475 23.674C132.223 23.674 131.985 23.59 131.985 23.59V22.624C132.713 22.624 133.021 22.288 133.287 21.644L133.609 20.832L130.781 13.72H132.069L134.253 19.306L136.437 13.72H137.725L134.575 21.644C133.987 23.1 133.427 23.674 132.475 23.674Z" fill="#1A2737" />
                    </svg> : <></>
                }

              </div> : <></>
          }

          {showHistory ? <div className="history-text">
            <svg onClick={() => {
              setChatHistory([])
              setShowHistory(false)
            }} width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.28061 0.9923C7.44333 1.15502 7.44333 1.41884 7.28061 1.58156L3.69546 5.16671H15.0836C15.3137 5.16671 15.5002 5.35325 15.5002 5.58337V6.41671C15.5002 6.64682 15.3137 6.83337 15.0836 6.83337H3.69358L7.2806 10.4204C7.44332 10.5831 7.44332 10.8469 7.2806 11.0097L6.69135 11.5989C6.52863 11.7616 6.26481 11.7616 6.10209 11.5989L0.798796 6.2956C0.636078 6.13288 0.636078 5.86906 0.798797 5.70635L6.1021 0.403045C6.26482 0.240326 6.52863 0.240326 6.69135 0.403045L7.28061 0.9923Z" fill="#4E6583" />
            </svg>

            <h3>Chat history</h3>
          </div> : <></>}
          {backContexttitle != null ? <div className="history-text">
            <svg onClick={() => {
              setBackContextTitle(null)
              setShowHistory(true)
            }} width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.28061 0.9923C7.44333 1.15502 7.44333 1.41884 7.28061 1.58156L3.69546 5.16671H15.0836C15.3137 5.16671 15.5002 5.35325 15.5002 5.58337V6.41671C15.5002 6.64682 15.3137 6.83337 15.0836 6.83337H3.69358L7.2806 10.4204C7.44332 10.5831 7.44332 10.8469 7.2806 11.0097L6.69135 11.5989C6.52863 11.7616 6.26481 11.7616 6.10209 11.5989L0.798796 6.2956C0.636078 6.13288 0.636078 5.86906 0.798797 5.70635L6.1021 0.403045C6.26482 0.240326 6.52863 0.240326 6.69135 0.403045L7.28061 0.9923Z" fill="#4E6583" />
            </svg>

            <h3>{backContexttitle}</h3>
          </div> : <></>}
          <div
            id="scrollableDiv"
            style={{
              maxHeight: "70vh",
              minHeight: "60vh",
              overflow: "auto",
            }}
          >
            {/*Put the scroll bar always on the bottom*/}
            <InfiniteScroll
              dataLength={chatHistory.length} //This is important field to render the next data
              next={fetchMoreData}
              hasMore={true}
              loader={<h4 style={{ display: "none" }}>''</h4>}
              endMessage={
                <p style={{ textAlign: "center" }}>
                  <b>Yay! You have seen it all</b>
                </p>
              }
              // below props only if you need pull down functionality
              refreshFunction={() => {
                console.log("refreshed");
              }}
              pullDownToRefresh
              pullDownToRefreshThreshold={50}
              pullDownToRefreshContent={
                <h3 style={{ textAlign: "center" }}>
                  &#8595; Pull down to refresh
                </h3>
              }
              releaseToRefreshContent={
                <h3 style={{ textAlign: "center" }}>
                  &#8593; Release to refresh
                </h3>
              }
            >
              {
                showHistory && calledHistoryapi.length > 0 ?
                  calledHistoryapi.map((chatHistory, historyindex) => {
                    if (new Date(chatHistory.updated_at).getUTCDate() != new Date().getUTCDate()) {
                      previousDays++
                    }
                    else if (new Date(chatHistory.updated_at).getUTCDate() == new Date().getUTCDate()) {
                      currentDay++
                    }

                    //console.log(new Date(chatHistory.updated_at).getUTCDate(), new Date().getUTCDate())
                    //console.log(new Date(chatHistory.updated_at).getUTCDate() == new Date().getUTCDate())
                    return (
                      <>
                        {(new Date(chatHistory.updated_at).getUTCDate() == new Date().getUTCDate()) && currentDay == 1 ? <div className="history-title">
                          <h3>Today’s conversations</h3>
                        </div> : (new Date(chatHistory.updated_at).getUTCDate() != new Date().getUTCDate()) && previousDays == 1 ? <div className="history-title">
                          <h3>Previous conversations</h3>
                        </div> : ""}
                        <div className="history-text">
                          <p>{chatHistory.history_context}</p>
                          <svg onClick={() => {
                            let showSelectedHistoryMessage = []
                            chatHistory.messages.map((el, ind) => {
                              if (ind % 2 == 0) {
                                showSelectedHistoryMessage.push({ query: el.message_text, response: chatHistory.messages[ind + 1].message_text })
                              }
                              setBackContextTitle(chatHistory.history_context)
                              setChatHistory(showSelectedHistoryMessage)
                              setShowHistory(false)
                            })


                            //console.log(showSelectedHistoryMessage, "dmatting")

                          }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.6467 11.6464L11.3538 7.35348C11.1586 7.15822 10.842 7.15822 10.6467 7.35348L9.94332 8.05686C9.74825 8.25193 9.74803 8.56814 9.94283 8.76348L13.1703 11.9999L9.94283 15.2364C9.74803 15.4317 9.74825 15.7479 9.94332 15.943L10.6467 16.6464C10.842 16.8416 11.1586 16.8416 11.3538 16.6464L15.6467 12.3535C15.842 12.1582 15.842 11.8416 15.6467 11.6464Z" fill="#3E5674" />
                          </svg>
                        </div>
                        <hr></hr>
                      </>
                    )
                  })
                  :
                  showHistory ? <div>No chat history yet!</div> :
                    chatHistory.length
                      ? chatHistory.map((chat, index) => (
                        <div key={index} className="chatbox-content">
                          {
                            <>
                              {chat.query && (
                                <div className="message-orange">
                                  <p className="message-content">{chat.query}</p>
                                </div>
                              )}
                              {chat.response && (
                                <>
                                  <div className="message-blue">
                                    <p className="message-content">
                                      <TextWithCodeBlocks text={chat.response} />
                                    </p>
                                  </div>
                                  <span className="icon-looks">
                                    {
                                      thumbsup[`${index}${userHandle}${sessionId}${courseId}`] ?
                                        <img src={thumpsupclicked} onClick={() => thumbupHandler(index, userHandle, sessionId, courseId)} alt="Lab Background" /> :
                                        <img src={thumpsup} onClick={() => thumbupHandler(index, userHandle, sessionId, courseId)} alt="Lab Background" />
                                    }
                                    {
                                      thumbsdown[`${index}${userHandle}${sessionId}${courseId}`] ?
                                        <img src={thumpsdownclicked} onClick={() => thumbdownHandler(index, userHandle, sessionId, courseId)} alt="Lab Background" /> :
                                        <img src={thumpsdown} onClick={() => thumbdownHandler(index, userHandle, sessionId, courseId)} alt="Lab Background" />
                                    }

                                    <img src={copy} alt="lab copy" />
                                  </span>
                                </>
                              )}
                            </>
                          }
                        </div>
                      ))
                      : freqAskQuestions.map((question) => (
                        <div className="chatbox-faqQuestion">{question}</div>
                      ))}

              {isFetchingResponse && <ProfileSkeleton />}
            </InfiniteScroll>
          </div>
          <FormControlProvider style={{ padding: "10px" }}>
            <Input
              describedBy="email:help"
              id="askHere"
              name="askHere"
              placeholder="Ask your question here"
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            {!isFetchingResponse && (
              <div className="icon" onClick={handleSubmit}>
                <img
                  src={inputValue.length > 0 ? search_active : search}
                  alt="Search Icon"
                />
              </div>
            )}
          </FormControlProvider>
        </div>
      )}
      {/* <header className="App-header">
        <Chatbot />
      </header> */}
    </div>
  );
}

export default Chatbot;
