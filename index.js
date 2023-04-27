"use strict";
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
const xlsx_1 = require("xlsx");
exports.default = (arg) => () => __awaiter(void 0, void 0, void 0, function* () {
    // helpers declarations
    let template;
    const templates = () => __awaiter(void 0, void 0, void 0, function* () {
        const { Sheets } = (0, xlsx_1.read)(yield arg.template.arrayBuffer());
        const rvar = /^\$\{([a-zA-Z0-9_]+)\}$/;
        template = {
            values: Object.entries(Sheets)
                .map(([sheet, table]) => Object.entries(table).filter(([cell, t]) => t.t === 's' && rvar.test(t.w || ''))
                .map(([cell, t]) => ({
                sheet,
                cell,
                rvar: t.v.match(rvar)[1]
            }))).flat()
        };
    });
    let source;
    let row = [];
    const rows = () => __awaiter(void 0, void 0, void 0, function* () {
        row = yield Promise.all(source.map((source) => __awaiter(void 0, void 0, void 0, function* () {
            const { Sheets } = (0, xlsx_1.read)(yield source.arrayBuffer());
            return {
                source,
                tuple: Object.fromEntries(template.values.map(({ sheet, cell, rvar }) => {
                    const c = Sheets[sheet][cell];
                    return [rvar, c.w];
                }))
            };
        })));
    });
    const sources = () => {
        if (Array.isArray(arg.source)) {
            source = arg.source;
        }
        else {
            source = [];
            for (let src = 0, end = arg.source.length; src < end; src++) {
                const s = arg.source.item(src);
                s && source.push(s);
            }
        }
    };
    // impls main control flow
    yield templates();
    sources();
    yield rows();
    return row;
});
