import React, { useState, useEffect } from "react";
import {
  unsafe_Input as Input,
  unsafe_FormControlProvider as FormControlProvider,
  unsafe_CircularProgress as CircularProgress,
} from "@pluralsight/react";
import InfiniteScroll from "react-infinite-scroll-component";

import { io } from "socket.io-client";
import logo from "./chatbot.svg";
import search from "./search.svg";

import "./chatbot.css";
import "../App.css";

const userhandle = "wing_test123";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonSwitcher, setButtonSwitcher] = React.useState(true);
  const [aiResponse, setAiresponse] = React.useState();
  const [value, setValue] = useState("");

  var socket = io("http://localhost:3003", { transports: ["websocket"] });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket!");
    });

    socket.on("error", () => {
      console.log("Error!");
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off("connect");
      socket.off("error");
    };
  }, []);

  const clearConversation = async () => {
    setIsOpen(false);

    await fetch("http://localhost:3003/clearConversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: userhandle }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAiresponse(data);
        //console.log(data)
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    socket.emit("getuserQuries", { sessionId: userhandle });
    socket.on("queryResponse", (msg) => {
      // console.log(state.chatarrayd,"before recieving message")
      //console.log(msg)
      setButtonSwitcher(true);
      setAiresponse(msg);
    });

    //   return () => {
    //     socket.disconnect();
    //   }
  }, []);

  const fetchMoreData = () => {
    //does nothing
    socket.emit("getuserQuries", { sessionId: userhandle });
  };

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = () => {
    setButtonSwitcher(false);
    socket.emit("userQuries", {
      message: value,
      topic: "aws",
      sessionId: userhandle,
    });
    setValue("");
  };

  return (
    <div className="App">
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
              <div
                className="chatbox-header-image"
                style={{
                  backgroundImage: `url(
                    "https://driftt.imgix.net/https%3A%2F%2Fdriftt.imgix.net%2Fhttps%253A%252F%252Fs3.us-east-1.amazonaws.com%252Fcustomer-api-avatars-prod%252F182116%252F9d7e05b10422a988877957d649c6b06dwa5fkwsa7c9x%3Ffit%3Dmax%26fm%3Dpng%26h%3D200%26w%3D200%26s%3D07f38bdbf45662d2512052f87abb4a26?fit=max&fm=png&h=200&w=200&s=05b4047f6fd8662e1e9a3446046d4571"
                  )`,
                }}
              ></div>
              <span className="chatbox-header-username">John Doe</span>
            </div>
            <div
              className="chatbox-header-close-icon"
              onClick={clearConversation}
            >
              {/* Insert your close icon component here */}
              &#x2715;
            </div>
          </div>
          <div
            id="scrollableDiv"
            style={{
              maxHeight: "70vh",
              overflow: "auto",
            }}
          >
            {/*Put the scroll bar always on the bottom*/}
            <InfiniteScroll
              dataLength={
                aiResponse && aiResponse.entireChat && aiResponse.entireChat
                  ? aiResponse.entireChat.length
                  : 1
              } //This is important field to render the next data
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
              {!buttonSwitcher && (
                <CircularProgress
                  ariaLabel="Loading data"
                  kind="indeterminate"
                />
              )}
              {aiResponse &&
                aiResponse.entireChat &&
                aiResponse.entireChat.map((el, index) => (
                  <div key={index} className="chatbox-content">
                    {
                      <>
                        <div className="message-orange">
                          <p className="message-content">{el.question}</p>
                        </div>
                        <div className="message-blue">
                          <p className="message-content">{el.response}</p>
                        </div>
                      </>
                    }
                  </div>
                ))}
            </InfiniteScroll>
          </div>
          <FormControlProvider style={{ padding: "10px" }}>
            <Input
              describedBy="email:help"
              id="askHere"
              name="askHere"
              placeholder="Ask here"
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <div className="icon" onClick={handleSubmit}>
              <img src={search} alt="Search Icon" />
            </div>
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
