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
import fs from "fs";
import {getLabidentity} from '../Repositary/connection'

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 3003;
const httpServer = http.createServer(app);
// const httpsServer = https.createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Establish Database Connection
/*appDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });*/

// configuration of cmd
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

let contextMessages:any=[];

type ContextType={
  'role':'user'|'system',
  'content':string
}

const initalQuery=async(title:string,description:string)=>{
  const { data } = await openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Your task is to find top topics from a text.
          Make each item one or two words long.
          Format your response as a list of items separated by commas.
          Text: "${title}. ${description}" `
        },
      ],
    },
    {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  );
  const currentMessage = data.choices[0];
  const { content }: any = currentMessage.message;
  return content
}

// maintaing the context here

const get_completion=async(query:string)=>{
  const {data} = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${query}` }],
  });
  return data
}

const get_completion_from_messages=async(messages:ContextType[])=>{
  const {data} = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });

  return data
}



const topicMap: any = {
  "123": "AWS Lambda hands-on",
};

const userQuriesStore:any = {};



io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userQuery", async ({ sessionId, query, courseId,firstQuery=false }) => {
    console.log(`Querying >>> ${query}`);

    // if (!topicMap[courseId]) {
    //   console.error("Course Not found");
    //   return;
    // }

    // const topicName = topicMap[courseId];
    // console.log(courseId,"logging course id")
    const getTopicName:any=await getLabidentity(courseId)
    console.log("what is coming from db",getTopicName)

    if (getTopicName.platform==undefined) {
      console.error("Course Not found");
      io.emit("queryResponse", {
        response:"QueryNotFound",
        sessionId,
        entireChat: userQuriesStore[sessionId],
      });
      console.error("Course Not found");
      return;
    }

    const listofOutput=await initalQuery(getTopicName.title,getTopicName.description)
    console.log('logging what can it return',listofOutput)

    const list=listofOutput.split(",")
    const scopeToBeMaintained=[...list,getTopicName.platform]
    console.log(scopeToBeMaintained,"logg our list of scopes")
    const formattedLists = JSON.stringify(scopeToBeMaintained)

    // console.log(getTopicName,"logging the topic name")
    const topicName=getTopicName.platform



    
  
    let response:string;
    let iscode:[]|String[]=[]

      let data1;
      if(contextMessages.length>0)
      {
        contextMessages=[...contextMessages,{'role':'user', 'content':query}]
        data1=await get_completion_from_messages(contextMessages)
      }
      else
      {
        contextMessages=[...contextMessages,{'role':'user', 'content':query}]
        data1 = await get_completion(query)
      }
      const currentMessage = data1.choices[0];
      const { content }: any = currentMessage.message;
      response = content
      let donotchangeRes=response
      contextMessages=[...contextMessages,{'role':'assistant', 'content':response}]

      if(response.split("```").length>1){
        iscode=response.split("```")
      }

      const { data } = await openai.createChatCompletion(
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Do you think the context "${donotchangeRes}" is related to any of these lists: ${formattedLists}?, just YES or No no other response`
            },
          ],
        },
        {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        }
      );

      const isValidQuery:any =  data.choices[0].message && data.choices[0].message.content && data.choices[0].message.content.split(",");
      console.log(isValidQuery,"sasasa")
      if (
        isValidQuery[0][0].toUpperCase() === "N" &&
        isValidQuery[0][1].toUpperCase() === "O"
      ) {
        response = "sorry i dont have any context regarding this query..";
      }

    if (userQuriesStore[sessionId]) {
      userQuriesStore[sessionId] = [
        ...userQuriesStore[sessionId],
        { question: [query], response,iscode },
      ];
    } else {
      userQuriesStore[sessionId] = [
        { question: [query], response ,iscode},
      ];
    }

    console.log(`OpenAI Completion <<<`);
    io.emit("queryResponse", {
      response,
      sessionId,
      entireChat: userQuriesStore[sessionId],
    });
  });

  socket.on("getuserQuries", async ({ sessionId, query, courseId }) => {
    io.emit("queryResponse", {
      response: null,
      sessionId,
      entireChat: userQuriesStore[sessionId],
    });
  });
});

app.post("/clearConversation", (req, res) => {
  const { sessionId } = req.body;
  res.send({
    response: null,
    sessionId,
  });
});

httpServer.listen(3003, () => {
  console.log(`Seamless learning listening on port http://localhost:${3003}`);
});
