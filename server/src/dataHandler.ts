import { User_mongo, User_ChatHistroy_mongo, FeedbackAnalytics_mongo, Code_Labs_Data_mongo } from "../Repositary/mongo/db"

import argon2 from 'argon2'
import mongoose from 'mongoose'
import { ParsedQs } from "qs";
import { v4 as uuidv4 } from 'uuid';
import { get_completion } from "./index"
import {Messages} from './index'
export const addDatatoDb = async (userHandle: string) => {
    // note this is a temp data, since we dont have actual userdata
    // we need to replicate identity table or users table, and then send that handle fron client
    // using dump data for password, name, email as for demo
    const password = await argon2.hash('test123');
    const user1 = new User_mongo({
        handle: userHandle,
        name: "darkwingtest",
        email: "darkwing@gmail.com",
        password,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })

    await user1.save()
    // console.log(user1, "logg the user created data")
    return user1
}


export const getUserData = async (userHandle: string) => {
    const userdatahandle = await User_mongo.findOne({ handle: userHandle })
    //  console.log(userdatahandle, "logging the find user data")
    return userdatahandle
}

export const checkUserChatExists = async (userHandle: string, session_id: string, courseId: string) => {
    const findexistingchat = await User_ChatHistroy_mongo.findOne({ user_id: userHandle, session_id, content_id: courseId })

    // console.log(findexistingchat, "logg the existing chat conversation")
    return findexistingchat
}

export const initial_insert_ChatConverstation = async (userHandle: string, sessionId: string, courseId: string, query: String, response: string) => {


    let data: any = await get_completion(`Create a Context for this query: "${query}" in strictly 20 letters`)
    const currentMessage = data.choices[0];
    const { content }: any = currentMessage.message;
    //console.log(content,"kkjkjjkjk")
    const userchat = new User_ChatHistroy_mongo({
        user_id: userHandle,
        session_id: sessionId,
        content_id: courseId,
        content_type: "lab",
        history_context: content,
        messages: [
            {
                "id": uuidv4(),
                "sender": "user",
                "message_text": query,
                "timestamp": new Date().toISOString()
            },
            {
                "id": uuidv4(),
                "sender": "assistant",
                "message_text": response,
                "timestamp": new Date().toISOString()
            }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })

    await userchat.save()
    // console.log(userchat, "logg the user inserted data")
    return userchat
}

export const feedback_analytics = async (userHandle: string, sessionId: string, courseId: string, message_index: number, feedback: boolean) => {
    const addingFeedback = new FeedbackAnalytics_mongo({
        user_id: userHandle,
        session_id: sessionId,
        content_id: courseId,
        message_index: message_index,
        feedback: feedback
    })

    await addingFeedback.save()
    return addingFeedback
}

export const update_current_conversation = async (userHandle: string, sessionId: string, courseId: string, query: String, response: string) => {

    const modifiedLike = await User_ChatHistroy_mongo.updateOne({ user_id: userHandle, session_id: sessionId, content_id: courseId }, {
        $push: {
            messages: {
                $each: [{
                    "id": uuidv4(),
                    "sender": "user",
                    "message_text": query,
                    "timestamp": new Date().toISOString()
                },
                {
                    "id": uuidv4(),
                    "sender": "assistant",
                    "message_text": response,
                    "timestamp": new Date().toISOString()
                }

                ]
            },
        }
    })

    return modifiedLike
}

export const adding_into_user_history_langchain = async (userHandle: string | string[] | ParsedQs | ParsedQs[] | undefined, sessionId: string | string[] | ParsedQs | ParsedQs[] | undefined, courseId: string | string[] | ParsedQs | ParsedQs[] | undefined, messages:Messages[]) => {

    let data: any = await get_completion(`Create a Context for this query: "${messages[1].message_text}" in strictly 20 letters`)
    const currentMessage = data.choices[0];
    const { content }: any = currentMessage.message;
    //console.log(content,"kkjkjjkjk")
    const userchat = new User_ChatHistroy_mongo({
        user_id: userHandle,
        session_id: sessionId,
        content_id: courseId,
        content_type: "lab",
        history_context: content,
        messages: messages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })

    await userchat.save()
    // console.log(userchat, "logg the user inserted data")
    return userchat
}

export const get_user_chat_history = async (userHandle: string | string[] | ParsedQs | ParsedQs[] | undefined, sessionId: string | string[] | ParsedQs | ParsedQs[] | undefined, courseId: string | string[] | ParsedQs | ParsedQs[] | undefined) => {
    if (userHandle && courseId && sessionId) {
        const findexistingchat = await User_ChatHistroy_mongo.findOne({ user_id: userHandle, session_id: sessionId, content_id: courseId })

        //   console.log(findexistingchat, "logg the existing chat conversation")
        return findexistingchat
    }
    else if (userHandle && courseId) {
        const findexistingchat = await User_ChatHistroy_mongo.findOne({ user_id: userHandle, content_id: courseId })

        //   console.log(findexistingchat, "logg the existing chat conversation")
        return findexistingchat
    }
    else if (userHandle && sessionId) {
        const findexistingchat = await User_ChatHistroy_mongo.findOne({ user_id: userHandle, session_id: sessionId })

        //  console.log(findexistingchat, "logg the existing chat conversation")
        return findexistingchat
    }
    else if (userHandle) {
        const findexistingchat = await User_ChatHistroy_mongo.find({ user_id: userHandle }).sort({ created_at: -1 }).limit(10);

        //   console.log(findexistingchat, "logg the existing chat conversation")
        return findexistingchat
    }
}


export const add_code_lab_data_init = async (data: any) => {

    const exists=await Code_Labs_Data_mongo.findOne({CODELABID:data.CODELABID})

    if(!exists)
    {
        const addcodedata = new Code_Labs_Data_mongo({
            ...data
        })
    
        await addcodedata.save()
        return addcodedata
    }

}

export const get_code_lab_data = async (limit?: string | number | ParsedQs | string[] | ParsedQs[] | undefined, offset?: string | number | ParsedQs | string[] | ParsedQs[] | undefined) => {
    const getcodelabdata =
        limit && offset ? await Code_Labs_Data_mongo.find({}).limit(Number(limit)).skip(Number(offset))
            : limit ? await Code_Labs_Data_mongo.find({}).limit(Number(limit)) : offset ?
                await Code_Labs_Data_mongo.find({}).skip(Number(offset))
                : await Code_Labs_Data_mongo.find({})

    return getcodelabdata
}


export const get_code_lab_details=async(codlabid:string)=>{

    let getcodelabdata=await Code_Labs_Data_mongo.findOne({CODELABID:codlabid})

    return getcodelabdata
}