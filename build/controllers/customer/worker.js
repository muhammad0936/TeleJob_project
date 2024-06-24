"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../decorators");
const customError_1 = require("../interfaces/customError");
const models_1 = require("../../models");
const isAuth_1 = require("../../middlewares/isAuth");
let customer = class customer {
    getWorkers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // interface filters {
            //   name?: string;
            //   categories?: string[];
            // }
            // const allowedProperties = ['name', 'categories'];
            // const filters = Object.keys(req.query)
            //   .filter((key: string) => allowedProperties.includes(key))
            //   .reduce((obj: Record<string, any>, key: string) => {
            //     obj[key] = req.query[key];
            //     return obj;
            //   }, {});
            const workers = yield models_1.Worker.find().select('_id name description address');
            if (!workers[0]) {
                res.status(404).json({ message: 'No workers to show!', workers: [] });
            }
            res.status(200).json({ message: 'Workers: ', workers });
        });
    }
    getSingleWorker(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workerId } = req.params;
            const worker = yield models_1.Worker.findById(workerId)
                .populate({ path: 'JobCategories', select: 'name' })
                .select('-createdAt -updatedAt -__v -password');
            if (!worker)
                throw new customError_1.CustomError('Worker not found!', 404);
            res.status(200).json({
                message: 'Worker info: ',
                worker,
            });
        });
    }
    sendJobRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workerId, jobDescription, JobCategories } = req.body;
            const customerId = req.userId;
            const customer = yield models_1.Customer.findById(customerId);
            if (!customer) {
                throw new customError_1.CustomError('Customer not found!', 404);
            }
            const worker = yield models_1.Worker.findById(workerId);
            if (!worker) {
                throw new customError_1.CustomError('Worker not found!', 404);
            }
            let imagesUrls = [];
            if (req.files) {
                const files = req.files;
                for (let file of files) {
                    if (file.path)
                        imagesUrls.push(file.path);
                }
            }
            const jobRequest = new models_1.JobRequest({
                customer: customerId,
                worker: workerId,
                jobDescription,
                imagesUrls,
                JobCategories,
            });
            yield jobRequest.save();
            res.status(201).json({ message: 'Job request sent successfully.' });
        });
    }
    getJobRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.userId;
            console.log('customerId: ', customerId);
            const customer = yield models_1.Customer.findById(customerId);
            if (!customer)
                throw new customError_1.CustomError('Customer not found!', 404);
            const requests = yield models_1.JobRequest.find({ customer: customerId })
                .select('_id jobDescription status')
                .populate({ path: 'worker', select: 'name' })
                .populate({ path: 'JobCategories', select: 'name' });
            if (!requests[0])
                res
                    .status(404)
                    .json({ message: 'No job requests to show.', requests: [] });
            res.status(200).json({ message: 'sent job requests: ', requests });
        });
    }
    getSingleRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.userId;
            const { requestId } = req.params;
            const customer = yield models_1.Customer.findById(customerId);
            if (!customer)
                throw new customError_1.CustomError('Customer not found!', 404);
            const request = yield models_1.JobRequest.findById(requestId)
                .populate({ path: 'worker', select: 'name' })
                .populate({ path: 'JobCategories', select: 'name' })
                .select('jobDescription imagesUrls status createdAt');
            if (!request)
                throw new customError_1.CustomError('Job request not found!', 404);
            const endDate = new Date(request.createdAt.getTime() + 43200000);
            const returnedRequest = { _doc: {} };
            Object.assign(returnedRequest, request);
            res.status(200).json({
                message: 'Job request information: ',
                request: Object.assign(Object.assign({}, returnedRequest._doc), { endDate }),
            });
        });
    }
    cancelJobRequst(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { requestId } = req.params;
            const request = yield models_1.JobRequest.findById(requestId);
            if (!request)
                throw new customError_1.CustomError('Job request not found!', 404);
            const customer = yield models_1.Customer.findById(req.userId);
            if (!customer || customer._id.toString() !== ((_a = request.customer) === null || _a === void 0 ? void 0 : _a.toString()))
                throw new customError_1.CustomError('Not authorized to cancel this job request!', 401);
            yield request.deleteOne();
            res.status(201).json({ message: 'Job request deleted successfully.' });
        });
    }
};
__decorate([
    decorators_1.catchError,
    (0, decorators_1.get)('/workers')
    // @use(isAuth)
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], customer.prototype, "getWorkers", null);
__decorate([
    decorators_1.catchError,
    (0, decorators_1.get)('/worker/:workerId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], customer.prototype, "getSingleWorker", null);
__decorate([
    decorators_1.catchError,
    (0, decorators_1.post)('/request'),
    (0, decorators_1.use)(isAuth_1.isAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], customer.prototype, "sendJobRequest", null);
__decorate([
    decorators_1.catchError,
    (0, decorators_1.get)('/requests'),
    (0, decorators_1.use)(isAuth_1.isAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], customer.prototype, "getJobRequests", null);
__decorate([
    decorators_1.catchError,
    (0, decorators_1.get)('/request/:requestId'),
    (0, decorators_1.use)(isAuth_1.isAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], customer.prototype, "getSingleRequest", null);
__decorate([
    decorators_1.catchError,
    (0, decorators_1.del)('/request/:requestId'),
    (0, decorators_1.use)(isAuth_1.isAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], customer.prototype, "cancelJobRequst", null);
customer = __decorate([
    (0, decorators_1.controller)('/customer')
], customer);
