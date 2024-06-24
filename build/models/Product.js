"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        unique: true,
    },
    price: Number,
    photosUrls: [String],
}, { timestamps: true });
exports.Product = (0, mongoose_1.model)('Product', ProductSchema);
