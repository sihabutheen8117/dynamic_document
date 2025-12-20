import mongoose from "mongoose";
const { Schema } = mongoose;


const ExcelSchema = mongoose.Schema({
    email : 
    {
        type : mongoose.Schema.Types.String,
        required : true ,
    },
    name : 
    {
        type : mongoose.Schema.Types.String,
        required : true , 
    },
    },
    { timestamps: true } 
)


export const Excel = mongoose.model('Excel' , ExcelSchema)