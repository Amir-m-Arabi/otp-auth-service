"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use("/", (0, routes_1.default)());
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
