import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        lowercase: true,
        trim: true,
        default: "Muhammad"
    },
    gender: {
        type: String,
        required: [true, 'gender is required'],
        enum: ["male", "female", "other"],
        default: "male"
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
    },
    profileImage: {
        type: String,
        required: [true, 'profileImage is required'],
        default: null

    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [4, 'Password must be at least 4 characters long'],
        maxlength: [10, 'Password cannot exceed 10 characters']
    },
    employNumber: {
        type: String,
        required: [true, 'employNumber is required'],
        unique: true,
        index: true // for makeing search able and optimmazing
    },
    phoneNumber: {
        type: String,
        default: '',
        unique: true,
        required: [true, 'phoneNumber is required'],

    },
    passportNumber: {
        type: String,
        default: '',
        unique: true,
        required: [true, 'passportNumber/ID card is required'],
    },
    isActive: {
        type: Boolean,
        default: false,  // Indicates if the employee is actively employed or on leave
    },
    dutyStatus: {
        type: String,
        enum: ['on-duty', 'off-duty', 'left'], // Tracks if the employee is on duty or has left
        default: 'on-duty',  // Default to off-duty when created
        required: true
    },
    joinDate: {
        type: Date,
        default: Date.now,  // Automatically set the date when the document is created
        immutable: true,    // This makes the field unchangeable after it's set
        required: true
    },
    designation: {
        type: String,
        enum: ['employee', 'HOD', 'HR', 'RM', 'Security'], // Allowed values for designation
        // little confussion which designation required or not 
        // enum: ['employee', 'HOD', 'HR', 'RM', 'Security', 'thirdParty', 'supervisor'], // Allowed values for designation
        default: 'employee',  // Default value
        required: [true, 'designation is required']
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',     // Reference to the department
        // required: true
    },
    leaveHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leave'    // Array to store leave request references
    }],

},
    {
        timestamps: true
    }
)


export const User = mongoose.model("User", userSchema)