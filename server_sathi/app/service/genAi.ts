import {createAgent, toolStrategy} from "langchain";
import {ChatVertexAI} from "@langchain/google-vertexai";

const llm = new ChatVertexAI({
    model: process.env.MODEL,
    vertexai: true,
    location: process.env.LOCATION,
    authOptions:{
        projectId: process.env.PROJECT_ID
    }
});

const agent = createAgent({
    model: llm,
    tools:[],

})