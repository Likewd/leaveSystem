import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true
    },  // Department name, e.g., HR, IT, Finance
    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },  // Reference to the HOD (Head of Department)

},
    {
        timestamps: true
    }
);

export const Department = mongoose.model('Department', departmentSchema);

