import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },  // Department name, e.g., HR, IT, Finance
    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },  // Reference to the HOD (Head of Department)
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],  // Array of employees in this department

},
    {
        timestamps: true
    }
);

export const Department = mongoose.model('Department', departmentSchema);

