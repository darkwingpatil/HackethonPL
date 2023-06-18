import { Configuration, OpenAIApi } from "openai"
import readline from "readline"
import dotenv from 'dotenv';
import express from 'express'
import http from "http"
import { Server } from "socket.io"
import cors from 'cors'
const app = express()
const server = http.createServer(app)
const io = new Server(server)
dotenv.config();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//configuration of cmd
const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

//configuration of openAi
const openai = new OpenAIApi(
    new Configuration({
        apiKey: process.env.API_KEY
    })
)

// we can store the data atleast for day, when user returns back he will see his previous responses
// we can use MongoDb HERE
var userQuriesStore = {}

//this will have some thing like this format
// userQuriesStore={'session_id':[{'question':'ai response'}]}

// handling the user interaction via socket with session for indivisual session 
io.on("connection", (socket) => {
    console.log("User connected")

    socket.on("userQuries", async (input) => {
        // note input will have {message,sessionId,topic}
        // suppose user is querying based on his previous response we will have to take care of it using session
        //console.log(input)
        let res = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Do you think topic "${input.message}" is related to "${input.topic}", just YES or No no other response` }]
        })
        
        let isValidQuery=res.data.choices[0].message.content.split(',')
        //console.log(isValidQuery[0].toUpperCase(),'validating!!')
        let data='sorry i dont have any context regarding this query..'
        if(isValidQuery[0][0].toUpperCase()==='Y' && isValidQuery[0][1].toUpperCase()==='E' && isValidQuery[0][2].toUpperCase()==='S'){
            let newres = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `${input.message}` }]
            })
            data=newres.data.choices[0].message.content

        }
        if (userQuriesStore[input.sessionId]) {
                userQuriesStore[input.sessionId] = [...userQuriesStore[input.sessionId], { 'question':[input['message']],'response': data }]
        }
        else {
                userQuriesStore[input.sessionId] = [{ 'question':[input['message']],'response': data }]
        }
    
        io.emit('queryResponse', { response: res.data.choices[0].message.content, sessionId: input.sessionId, entireChat: userQuriesStore[input.sessionId] })

    })

    socket.on('getuserQuries', async (input)=>{
        io.emit('queryResponse', { response:null,sessionId:input.sessionId,entireChat: userQuriesStore[input.sessionId] })
    })
})

app.post("/clearConversation",(req,res)=>{
    //console.log(req.body,'body logging')
    const{sessionId}=req.body
    if(userQuriesStore[sessionId]){
        userQuriesStore[sessionId]=[]
    }
    res.send({response:null,sessionId:sessionId,entireChat: userQuriesStore[sessionId] })
})
const Port = process.env.PORT ? process.env.PORT : 3003

server.listen(Port, () => {
    console.log("server started")
})
