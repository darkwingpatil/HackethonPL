import mongoose from "mongoose"

const UserSchema=new mongoose.Schema({
    handle:String,
    username:String,
    email:String,
    password: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    }
})


const UserChatHistroy=new mongoose.Schema({
        user_id: String,
        session_id: String,
        content_id: String,
        content_type: String,
        history_context:String,
        messages: [
          {
            "id": String,
            "sender": String,
            "message_text": String,
            "timestamp":  {
                type: Date,
                default: Date.now,
            }
          }
        ],
        "created_at": {
            type: Date,
            default: Date.now,
        },
        "updated_at": {
            type: Date,
            default: Date.now,
        }

})

const FeedbackAnalytics=new mongoose.Schema({
    user_id: String,
    session_id: String,
    content_id: String,
    message_index: Number,
    feedback: {
        type: Boolean,
        default: null,
    }
})

const CodeLabsData=new mongoose.Schema({
    CODELABID: String,
    CODELABSLUG: String || null,
    CODELABTITLE: String,
    CODELABTYPE: String,
    COURSEDESCRIPTION: String || null,
    COURSEID: String,
    COURSENAME: String,
    CREATEDAT: {
        type: Date,
        default: Date.now,
    },
    TOTALTASKS: String,
    UPDATEDAT: {
        type: Date,
        default: Date.now,
    },
    _METADATA__CREATETIME: {
        type: Date,
        default: Date.now,
    },
    _METADATA__KEY: Object,
    _METADATA__KEY_SCHEMA_ID: String,
    _METADATA__OFFSET: String,
    _METADATA__PARTITION: String,
    _METADATA__SCHEMA_ID: String,
    _METADATA__TOPIC: String,
    _REPLICATION_DATE: {
        type: Date,
        default: Date.now,
    }
})



export const User_mongo=mongoose.model("Userdata",UserSchema)
export const User_ChatHistroy_mongo=mongoose.model("UserChatHistroy",UserChatHistroy)

export const FeedbackAnalytics_mongo=mongoose.model("FeedbackAnalytics",FeedbackAnalytics)

export const Code_Labs_Data_mongo=mongoose.model("CodeLabsData",CodeLabsData)


