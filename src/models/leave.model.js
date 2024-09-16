import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema({})

export const Leave = mongoose.model("Leave", leaveSchema)