import mongoose, { Schema } from "mongoose";

const permissionSchema = new Schema({
    name: {
        type: String,
        required: true,
        // unique: true
    } // e.g., 'Approve Leave Request', 'Reject Leave Request'
});

export const Permission = mongoose.model("Permission", permissionSchema)