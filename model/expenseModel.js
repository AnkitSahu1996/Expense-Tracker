const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    },
    Description: String,
    Categories: [
        {
            type: String,
            required: true
        }
    ],
    Tags: [
        {
            type: String,
            required: true
        }
    ],
    Date: {
        type: String,
        default: () => new Date().toLocaleDateString('en-IN') // 'dd/mm/yyyy'
    },
    
    // Add a reference to the User model
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users for Expense Tracker App'
    }
});

module.exports = mongoose.model('Expenses', expenseSchema);


