import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    typeOfLeave: {
        type: String,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    hodApproval: {
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        comment: String,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' } // HOD reference
    },
    hrApproval: {
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        comment: String,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' } // HR reference
    },
},
    {
        timestamps: true
    }
)

export const Leave = mongoose.model("Leave", leaveSchema)



