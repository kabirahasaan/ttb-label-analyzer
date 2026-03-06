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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const validation_engine_1 = require("./validation.engine");
const cross_check_validator_1 = require("./cross-check.validator");
/**
 * Validation Service for NestJS
 */
let ValidationService = class ValidationService {
    constructor() {
        this.validationEngine = new validation_engine_1.ValidationEngine();
        this.crossCheckValidator = new cross_check_validator_1.CrossCheckValidator();
    }
    validateLabel(labelData) {
        return this.validationEngine.validateLabel(labelData);
    }
    crossCheckLabelAndApplication(label, application) {
        return this.crossCheckValidator.validateLabelAgainstApplication(label, application);
    }
    async validateLabelAndApplication(label, application) {
        const validation = this.validateLabel(label);
        const crossCheck = this.crossCheckLabelAndApplication(label, application);
        return { validation, crossCheck };
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ValidationService);
//# sourceMappingURL=validation.service.js.map