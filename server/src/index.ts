import express from "express";
import { Request, Response } from "express";
import { appDataSource } from "./database/data-source";
import { Configuration, OpenAIApi } from "openai";
import readline from "readline";
import dotenv from "dotenv";
import https from "https";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { getLabidentity, getAll_labdata } from '../Repositary/connection'
import mongoose from 'mongoose'
//langchaon
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { v4 as uuidv4 } from 'uuid';
import { ChatMessageHistory } from "langchain/memory";
import { BufferMemory } from "langchain/memory";

import { HumanMessage, ChatMessage, SystemMessage } from "langchain/schema";



const connect = mongoose.connect("mongodb+srv://App123:Darkwing123@cluster0.56dvjei.mongodb.net/seamless-learning?retryWrites=true&w=majority")
import { getUserData, addDatatoDb, initial_insert_ChatConverstation, checkUserChatExists, update_current_conversation, get_user_chat_history, feedback_analytics, get_code_lab_data, get_code_lab_details,adding_into_user_history_langchain } from "./dataHandler"
import { seedData} from "./parser"
import { UUID } from "crypto";
import { Timestamp } from "typeorm";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express()
const apiServer = express()
const port = process.env.PORT || 4000;
const apiport = process.env.APIPORT || 8080
const httpServer = http.createServer(app);
// const httpsServer = https.createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


let formattedLists='["SPA"," Dotnet"," React"," Sandbox"," Building"," End-to-end"," ASP.NET Core 6"," Web API"]'

let chain: any;
const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// configuration of openAi
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
  })
);

let contextMessages: any = [];

type ContextType = {
  'role': 'user' | 'system',
  'content': string
}

export type Messages={
  "id": string,
  "sender": string,
  "message_text": string,
  "timestamp": string
}

const initalQuery = async (title:string, description:string) => {

  const chat = new ChatOpenAI({ openAIApiKey:"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",temperature: 0 });

  const result = await chat.predictMessages([
      new HumanMessage(`Your task is to find top topics from a text.
      Make each item one or two words long.
      Format your response as a list of items separated by commas.
      Text: "${title}. ${description}"`)
    ]);

    console.log(result,"ss")
    return result.content
}

// maintaing the context here



export const get_completion = async (query: string) => {
  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${query}` }],
    temperature: 0.2
  });
  return data
}

const get_completion_from_messages = async (messages: ContextType[]) => {
  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.2
  });

  return data
}

// langchain

const settingupthecontext=async(courseId:string,userHandle:string)=>{
  const getTopicName: any = await get_code_lab_details(courseId)
    console.log("what is coming from db",getTopicName)

    // entireChat: userQuriesStore[sessionId]

    const userdatahandle = await getUserData(userHandle)

    // console.log("came here!!")
    let currentuser;
    if (!userdatahandle) {
      // here we should be getting the data from identity_v4 table or user table.
      // as temp solution adding dummy data
      // note we are not using any salt for hash and by default we are using sha256 algo

      currentuser = await addDatatoDb(userHandle)
    }

    const listofOutput = await initalQuery(getTopicName.CODELABTITLE, getTopicName.COURSEDESCRIPTION)
    console.log('logging what can it return',listofOutput)

    const list = listofOutput.split(",")
    const scopeToBeMaintained = [...list]
    //    console.log(scopeToBeMaintained,"logg our list of scopes")
    formattedLists = JSON.stringify(scopeToBeMaintained)

    console.log(formattedLists,"logging the formatted form name")
}


const chat = new ChatOpenAI({ openAIApiKey: "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", temperature: 0 });

const pastMessages = new ChatMessageHistory();

let text = `f"""
You are an AI tutor having knowleage and expertise on topics present in these lists: ${formattedLists}, You will be assiting the students. Note you will have knowleage only about topics present in these lists: ${formattedLists}  
"""`

let prompt_1 = `f"""
Perform the following actions: 
If the user query is related to your expertise which are topics present in these lists: ${formattedLists} then provide relevent response

If the user query is not related to your expertise then provide a response saying "I am sorry I do not know about that"

'''${text}'''
"""`
const context_wrapper=async()=>{
  await pastMessages.addUserMessage(prompt_1)

  const memory = new BufferMemory({
      chatHistory: pastMessages,
  });
  chain = new ConversationChain({ llm: chat, memory: memory });
}

context_wrapper()

const contruct_histroy_message_lang_chain=async()=>{
  
  let histroy = await pastMessages.getMessages()
  console.log(histroy)
  let formatedMessages: Messages[]=[]
  histroy.map((el:any,ind)=>{

    if(ind!=0 && el["content"]!=undefined)
    {
      if((ind%2!=0 && el["content"].split(":").length>1) )
      {
        formatedMessages.push({"id":uuidv4(),"sender":"user","message_text":el.content,"timestamp": new Date().toISOString()})
      }
      else if(ind%2==0)
      {
        formatedMessages.push({"id":uuidv4(),"sender":"user","message_text":el.content,"timestamp": new Date().toISOString()})
      }    
    }    
  })

  //console.log(formatedMessages)

  return formatedMessages
}




io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userQuery", async ({ sessionId, query, courseId, userHandle, firstQuery = false }) => {
    console.log(`Querying >>> ${query}`);
    console.log("userdata", sessionId, courseId, userHandle)


    let response = await chain.call({
      input: `User: ${query}`,
  });

  await pastMessages.addUserMessage(query)
  await pastMessages.addAIChatMessage(response)

    // this is where we will be adding the message data to db

    // const find_Existing_user_convo = await checkUserChatExists(userHandle, sessionId, courseId)
    // if (!find_Existing_user_convo) {
    //   await initial_insert_ChatConverstation(userHandle, sessionId, courseId, query, response.response)
    // }
    // else {
    //   await update_current_conversation(userHandle, sessionId, courseId, query, response.response)
    // }

    // entireChat: userQuriesStore[sessionId],
    console.log(`OpenAI Completion <<<`);
    io.emit("queryResponse", {
      response:response.response,
      sessionId,
    });
  });

  // entireChat: userQuriesStore[sessionId],
  socket.on("getuserQuries", async ({ sessionId, query, courseId }) => {
    io.emit("queryResponse", {
      response: null,
      sessionId,
    });
  });
});


app.post('/settingContextPromptData',async(req,res)=>{
  const {courseId,userHandle}=req.body

  await settingupthecontext(courseId,userHandle)

  res.send("done!!")

})

app.post("/clearConversation", (req, res) => {
  const { sessionId } = req.body;
  res.send({
    response: null,
    sessionId,
  });
});

app.get("/entireConversation", async (req, res) => {

  const { userHandle, sessionId, courseId } = req.query
  let data = await get_user_chat_history(userHandle, sessionId, courseId)
  console.log(data)
  res.send({ data: data })
})

app.get("/listlabs", async (req, res) => {
  let { limit, offset } = req.query

  const data = await getAll_labdata(limit = limit ? limit : '10', offset = offset ? offset : '0')
  res.send({ data: data })
})

app.post("/updatefeedback", async (req, res) => {

  const { userHandle, sessionId, courseId, message_index, feedback } = req.body
  const feedbackAnalysis = feedback_analytics(userHandle, sessionId, courseId, message_index, feedback)
  res.send("processed!")
})

app.get("/codelablists", async (req, res) => {
  const { limit, offset } = req.query

  const codelabdata = limit && offset ? await get_code_lab_data(limit, offset) :
    limit ? await get_code_lab_data(limit) : offset ? await get_code_lab_data(offset)
      : await get_code_lab_data()
  res.send({ data: codelabdata })
})

app.get("/oncloseaddtohistory",async(req,res)=>{
  const { userHandle, sessionId, courseId } = req.query

  let contructedmessages=await contruct_histroy_message_lang_chain()

  await adding_into_user_history_langchain(userHandle,sessionId,courseId,contructedmessages)

  res.send("checking")
})

httpServer.listen(port, async() => {
    connect
    seedData()
  console.log(`Seamless learning listening on port http://localhost:${port}`);
});

apiServer.listen(apiport, () => {
  console.log("api server started")
})