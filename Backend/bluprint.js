import {Configuration,OpenAIApi} from "openai"
import readline from "readline"
import dotenv from 'dotenv';
import express from 'express'
import http from "http"
const app=express()
const server=http.createServer(app)
const io=new Server(server)
dotenv.config();
app.use(cors())

//configuration of cmd
const userInterface=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})

//configuration of openAi
const openai=new OpenAIApi(
    new Configuration({
        apiKey:process.env.API_KEY
    })
)

// THIS IS WHERE WE CAN ADD OUR SPECIFIC DATA
// let MyLab=['AWS','AZURE','GOOGLECLOUD']

// open up the prompt
userInterface.prompt()

// on every new line of cmd
// userInterface.on("line",async (input)=>{
//     // one of temporray validation we can optimize this
//     let isValidQuery;
//     // not wiht free account we can;t make 3 simultaneous api
//     for(let i=0;i<MyLab.length-1;i++){
//         console.log(MyLab[i])
//         let res=await openai.createChatCompletion({
//             model:"gpt-3.5-turbo",
//             messages:[{role:"user", content:`Is context ${input} releated to ${MyLab[i]}}`}]
//            })
//         let output=res.data.choices[0].message.content.split(',')
//         console.log(output)
//         if(output[0].toUpperCase()==='YES'){
//             isValidQuery=input
//         }
//     }
//     if(isValidQuery!=undefined){
//         let res=await openai.createChatCompletion({
//             model:"gpt-3.5-turbo",
//             messages:[{role:"user", content:input}]
//            })
//         console.log(res.data.choices[0].message.content) 
//     }
//     userInterface.prompt()
// })

io.on("connection",(socket)=>{
    console.log("User connected")

    socket.on("userQuries",async(input)=>{

        let res=await openai.createChatCompletion({
            model:"gpt-3.5-turbo",
            messages:[{role:"user", content:`First check this query ${input.message} is related to ${topic} or not, if it is not related then don't reply with the details for the user query. Otherwise provide some suggestions to that query within 100 words`}]
           })

        io.emit('queryResponse',{response:res.data.choices[0].message.content,sessionId:input.session})
    })
})

userInterface.on("line",async (input)=>{
    // one of temporray validation we can optimize this
    // not wiht free account we can;t make 3 simultaneous api
    for(let i=0;i<MyLab.length-1;i++){
        console.log(MyLab[i])
        let res=await openai.createChatCompletion({
            model:"gpt-3.5-turbo",
            messages:[{role:"user", content:`First check this query ${input} is related to ${topic} or not, if it is not related then don't reply with the details for the user query. Otherwise provide some suggestions to that query within 100 words`}]
           })
           
           console.log(res.data.choices[0].message.content)
        }
    userInterface.prompt()
})
