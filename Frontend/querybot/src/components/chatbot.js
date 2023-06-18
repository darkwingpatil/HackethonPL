import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import './chatbot.css'
const userhandle='wing_test123'


//This Ui Just for test purpose we will update it
export const Chatbot = () => {

    const [stateInput,setStateInput]=React.useState("")
    const[aiResponse,setAiresponse]=React.useState()
    const [buttonSwitcher,setButtonSwitcher]=React.useState(true)
    const inputRef=React.useRef()
    var socket = io('http://localhost:3003',{ transports : ['websocket'] });
    socket.on('connect', function () {
      console.log('connected!');
    })

    const clearConversation=async()=>{
        await fetch('http://localhost:3003/clearConversation',{
            method:'POST',
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({sessionId:userhandle})
        })
        .then((res)=>res.json())
        .then((data)=>{
            setAiresponse(data)
            //console.log(data)
        }
            )
        .catch((err)=>console.log(err))
        
    }
    
    React.useEffect(
        () => {
          socket.emit('getuserQuries',{sessionId:userhandle}) 
          socket.on("queryResponse", (msg)=>{
            // console.log(state.chatarrayd,"before recieving message")
            //console.log(msg)
            setButtonSwitcher(true)
            setAiresponse(msg)
          });
          
        //   return () => {
        //     socket.disconnect();
        //   }
        },[]
      )
      const handleSubmit=()=>{
        setButtonSwitcher(false)
        socket.emit('userQuries', {message:stateInput,topic:'aws',sessionId:userhandle});
        setStateInput('')
      }

      const fetchMoreData=()=>{
        //does nothing
        socket.emit('getuserQuries',{sessionId:userhandle}) 
      }
  return (
    <div>
        <div className='chat-bot'>
        <div
          id="scrollableDiv"
          style={{
            height: 500,
            overflow: 'auto'
          }}
        >
          {/*Put the scroll bar always on the bottom*/}
          <InfiniteScroll
            dataLength={aiResponse && aiResponse.entireChat && aiResponse.entireChat?aiResponse.entireChat.length:1} //This is important field to render the next data
            next={fetchMoreData}
            hasMore={true}
            loader={<h4 style={{'display':"none"}}>''</h4>}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
            // below props only if you need pull down functionality
            refreshFunction={() => {
              console.log("refreshed")
            }}
            pullDownToRefresh
            pullDownToRefreshThreshold={50}
            pullDownToRefreshContent={
              <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
            }
            releaseToRefreshContent={
              <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
            }
          >
            {aiResponse && aiResponse.entireChat && aiResponse.entireChat.map((el, index) => (
                
              <div key={index}>
                {
                    <>
                     <div className="message-orange">
                       <p className="message-content">{el.question}</p></div>
                     <div className="message-blue">
                       <p className="message-content">{el.response}</p>
                     </div>
                    </>
                }
              </div>
            ))}
          </InfiniteScroll>
        </div>
        <div>
          {
            buttonSwitcher ? <div>
              <input ref={inputRef} className='message-input' value={stateInput} onChange={(e) => setStateInput(e.target.value)} />
              <button className='message-button' onClick={handleSubmit}>Send</button>
            </div> : <div className="loader">Loading...</div>
          }
          <button className={'clear-messages'} onClick={clearConversation}>X</button>
        </div>
      </div>
    </div>
  )
}
