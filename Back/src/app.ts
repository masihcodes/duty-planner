import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "#middlewares/errorHandler.js";
import { notFound } from "#middlewares/notFound.js";
import { authRouter } from "#routes/authRouter.js";
import { planerRouter } from "#routes/planerRouter.js";
import { openPlanRouter } from "#routes/openPlanRouter.js";
import { adminPlanRouter } from "#routes/adminPlanRouter.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/auth", authRouter);
app.use("/planer", planerRouter);
app.use("/open-plans", openPlanRouter);
app.use("/admin", adminPlanRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
