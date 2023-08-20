// import { DVS } from "@pluralsight/ps-dvs-node";
// import config from "./database/orm-config";


// const replicateOptions = {
//     replicateBaseUrl: "https://hydra-streams-staging.vnerd.com",
//     replicateConfig: {
//         name: "LabGPT",
//         applicationId: "lab-gpt---skills.labs.v2.CloudLab",
//         startingOffsets: "earliest",
//         topics: ["skills.labs.v2.CloudLab"],
//         primaryKeys: {
//             "skills.labs.v2.CloudLab": "id"
//         },
//         properties: {
//             notificationsUrl:
//                 "http://hydra-notifications-staging.vnerd.com:8080/notify/slack?channel=seamless-learning-experience",
//             tableName: "cloud_lab_v2"
//         },
//         connection: {
//             url: `jdbc:postgresql://${config.database.host}:${config.database.port}/${config.database.db}?currentSchema=dvs`,
//             user: config.database.username,
//             password: config.database.password
//         }
//     }
// };

// async function initReplication() {
//     await DVS.replicate(replicateOptions);
// }

// initReplication();