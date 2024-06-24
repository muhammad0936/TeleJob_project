"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRequest = void 0;
const mongoose_1 = require("mongoose");
const { ObjectId } = mongoose_1.Schema.Types;
const RequestSchema = new mongoose_1.Schema({
    customer: {
        type: ObjectId,
        requierd: true,
        ref: 'Customer',
        index: true,
    },
    worker: {
        type: ObjectId,
        requierd: true,
        ref: 'Worker',
        index: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        // required: true,
    },
    imagesUrls: [String],
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
        required: true,
    },
    JobCategories: [
        {
            type: ObjectId,
            ref: 'JobCategory',
        },
    ],
}, { timestamps: true });
exports.JobRequest = (0, mongoose_1.model)('JobRequest', RequestSchema);
