import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        // unique: true
    }, // e.g., 'HOD', 'HR'
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }] // List of permission IDs
});


export const Role = mongoose.model("Role", roleSchema)