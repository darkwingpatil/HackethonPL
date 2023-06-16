import { Configuration, OpenAIApi } from "openai"
import readline from "readline"
import dotenv from 'dotenv';
import express from 'express'
import http from "http"
import { Server } from "socket.io"
const app = express()
const server = http.createServer(app)
const io = new Server(server)
dotenv.config();
app.use(cors())

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
        let res = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `First check this query ${input.message} is related to ${input.topic} or not, if it is not related then don't reply with the details for the user query. Otherwise provide some suggestions to that query within 100 words ` }]
        })

        userQuriesStore[input.sessionId] = [...userQuriesStore[input.sessionId], { [input['message']]: res.data.choices[0].message.content }]

        io.emit('queryResponse', { response: res.data.choices[0].message.content, sessionId: input.sessionId, entireChat: userQuriesStore[input.sessionId] })
    })
})
const Port = process.env.PORT ? process.env.PORT : 8080

server.listen(Port, () => {
    console.log("server started")
})
