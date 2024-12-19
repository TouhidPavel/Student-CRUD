const express =  require("express")
const mongoose =  require("mongoose")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const hpp = require("hpp")

const app = express()

// Security Middlewares
app.use(cookieParser())
app.use(cors())
app.use(helmet())
app.use(hpp())

// Define the Student Schema
const studentSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        rollNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

// Create Student Model
const Student = mongoose.model("Student", studentSchema)

// Body Parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create a Student
app.post("/api/students", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const studentAdd = new Student({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            rollNumber: req.body.rollNumber,
            phoneNumber: req.body.phoneNumber,
            password: hashedPassword,
        })
        await studentAdd.save()
        res.status(201).json({
            message: "Student Created Successfully",
            data: studentAdd
        })
    } catch (err) {
        res.status(500).json({
            error: "There was a Server Side Error",
            reason: err.message
        })
    }
})

// Get All Students
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find()
        if (!students) {
            return res.status(404).json({
                message: "No Student Found",
            })
        }
        res.status(200).json({
            message: "All Students Retrieved Successfully",
            data: students
        })
    } catch (err) {
        res.status(500).json({
            error: "There was a Server Side Error",
            reason: err.message
        })
    }
})

// Get a Single Student
app.get("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findOne({ _id: req.params.id })
        if (!student) {
            return res.status(404).json({
                message: "No Student Found",
            })
        }
        res.status(200).json({
            message: "Student Retrieved Successfully",
            data: student
        })
    } catch (err) {
        res.status(500).json({
            error: "There was a Server Side Error",
            reason: err.message
        })
    }
})

// Update a Student
app.put("/api/students/:id", async (req, res) => {
    try {
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            req.body.password = hashedPassword
        }
        const updatedStudent = await Student.findByIdAndUpdate(
            { _id: req.params.id },
            { $set: req.body },
            { new: true }
        )
        if (!updatedStudent) {
            return res.status(404).json({
                message: "No Student Found",
            })
        }
        res.status(200).json({
            message: "Student Updated Successfully",
            data: updatedStudent
        })
    } catch (err) {
        res.status(500).json({
            error: "There was a Server Side Error",
            reason: err.message
        })
    }
})

// Delete a Student
app.delete("/api/students/:id", async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete({ _id: req.params.id })
        if (!deletedStudent) {
            return res.status(404).json({
                message: "No Student Found",
            })
        }
        res.status(200).json({
            message: "Student Deleted Successfully",
            data: deletedStudent
        })
    } catch (err) {
        res.status(500).json({
            error: "There was a Server Side Error",
            reason: err.message
        })
    }
})

// Connect to MongoDB
const connectDB = async () => {
    try {
        const DATABASE_URI = "mongodb+srv://touhid:touhid1234@cluster0.advoc.mongodb.net/studentDB"
        await mongoose.connect(DATABASE_URI)
        console.log("Database Connection Success!")
    } catch (err) {
        console.error("Database Connection Failed!")
        console.error(`Reason: ${err.message}`)
        process.exit(1)
    }
}
connectDB()

// 404 Handler
app.use((req, res, next) => {
    res.status(404).send('Bad URL Request: Page Not Found')
})

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: "Internal Server Error" })
})

// Start Server
const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`)
})