//? third party lib
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

//?Custom File
import { allRoutes } from "./src/Modules/index.routes.js";
import { ExamSchema, initialize } from "./DB/dbConnection.js";

const app = express();
dotenv.config();
app.use(morgan("dev"));
//?express middleware
app.use(cors());
app.use(express.json());

//? for images
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

//? all route
allRoutes(app);
initialize(app);

// cron job

// Make exams active when the start time is reached
// async function makeExamActive() {
//   const currentTime = new Date();
//   await examSchema.updateMany(
//     { startTime: { $lte: currentTime }, status: "Inactive" },
//     { $set: { status: "Active" } }
//   );
//   console.log("Checked and updated active exams.");
// }

// // Make exams inactive after their duration ends
// async function makeExamInactive() {
//   const currentTime = new Date();
//   await examSchema.updateMany(
//     {
//       startTime: { $lte: currentTime },
//       status: "Active",
//       duration: { $exists: true }, // Ensure duration exists
//       $expr: {
//         $lte: [
//           { $add: ["$startTime", { $multiply: ["$duration", 60 * 1000] }] },
//           currentTime,
//         ],
//       },
//     },
//     { $set: { status: "Inactive" } }
//   );
//   console.log("Checked and updated inactive exams.");
// }
// Make sure the path is correct for your setup

const updateExamStatus = async () => {
  console.log("jop works");
  try {
    const exams = await ExamSchema.findAll();
    const now = new Date();

    exams.forEach(async (exam) => {
      // log("exam", exams);
      const startTime = new Date(exam.startTime);
      const endTime = new Date(
        startTime.getTime() + parseInt(exam.duration) * 60000
      ); // Converts duration from minutes to milliseconds
      console.log("endTime", endTime);
      console.log("now", now);
      if (now >= startTime && now <= endTime) {
        console.log("active");
        if (exam.status !== "active") {
          exam.status = "active";
          await exam.save();
        }
      } else if (now > endTime) {
        console.log("finished");
        if (exam.status !== "finished") {
          exam.status = "finished";
          await exam.save();
        }
      } else {
        console.log("inActive");
        if (exam.status !== "inactive") {
          exam.status = "inactive";
          await exam.save();
        }
      }
      // console.log("jop ends");
    });
  } catch (error) {
    console.error("Failed to update exam statuses:", error);
  }
};

// Schedule the cron job to run every minute
// cron.schedule("* * * * *", updateExamStatus);

// Schedule the cron job to run every minute
// cron.schedule("* * * * *", makeExamActive);
// cron.schedule("* * * * *", makeExamInactive);
