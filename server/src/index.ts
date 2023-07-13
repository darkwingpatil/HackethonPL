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

const topicMap: any = {
  "123": "AWS Lambda hands-on",
};

const userQuriesStore:any = {};

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userQuery", async ({ sessionId, query, courseId }) => {
    console.log(`Querying >>> ${query}`);

    // if (!topicMap[courseId]) {
    //   console.error("Course Not found");
    //   return;
    // }

    // const topicName = topicMap[courseId];
    //console.log(courseId,"logging course id")
    let getTopicName:any=await getLabidentity(courseId)

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
    // console.log(getTopicName,"logging the topic name")
    const topicName=getTopicName.platform

    const { data } = await openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Do you think topic "${query}" is related to "${topicName}", just YES or No no other response`
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

    let response:string = "sorry i dont have any context regarding this query..";
    let iscode:[]|String[]=[]
    if (
      isValidQuery[0][0].toUpperCase() === "Y" &&
      isValidQuery[0][1].toUpperCase() === "E" &&
      isValidQuery[0][2].toUpperCase() === "S"
    ) {
      const {data} = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `${query}` }],
      });

      const currentMessage = data.choices[0];
      const { content }: any = currentMessage.message;
      response = content

      if(response.split("```").length>1){
        iscode=response.split("```")
      }

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

httpServer.listen(port, () => {
  console.log(`Seamless learning listening on port http://localhost:${port}`);
});
