import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../fixtures/load.js";
import { parseMovesInfo } from "../../src/modules/moves/regexMoves.js";

test("parseMovesInfo: campos de um move simples", () => {
    const moves = parseMovesInfo(fixture("moves_info.h"));
    const pound = moves.MOVE_POUND;

    assert.ok(pound, "MOVE_POUND ausente");
    assert.equal(pound.ingameName, "Pound");
    assert.equal(pound.power, 40);
    assert.equal(pound.PP, 35);
    assert.equal(pound.accuracy, 100);
    assert.equal(pound.type, "TYPE_NORMAL");
    assert.equal(pound.split, "SPLIT_PHYSICAL");
    assert.equal(pound.effect, "EFFECT_HIT");
    assert.ok(
        pound.description.join(" ").length > 0,
        "descricao vazia — COMPOUND_STRING nao foi juntado"
    );
});

test("parseMovesInfo: tipo atras de ternario pega o ramo atualizado", () => {
    // .type = B_UPDATED_MOVE_TYPES >= GEN_2 ? TYPE_FIGHTING : TYPE_NORMAL
    const moves = parseMovesInfo(fixture("moves_info.h"));
    assert.equal(moves.MOVE_KARATE_CHOP.type, "TYPE_FIGHTING");
});

test("parseMovesInfo: campos booleanos viram FLAG_*", () => {
    const moves = parseMovesInfo(fixture("moves_info.h"));
    assert.ok(
        moves.MOVE_POUND.flags.includes("FLAG_MAKES_CONTACT"),
        `flags: ${moves.MOVE_POUND.flags.join(", ")}`
    );
});

test("parseMovesInfo: invariantes de estrutura em todos os moves", () => {
    const moves = parseMovesInfo(fixture("moves_info.h"));
    assert.ok(Object.keys(moves).length >= 3);

    for (const [key, move] of Object.entries(moves)) {
        assert.match(key, /^MOVE_/);
        assert.equal(move.name, key);
        assert.equal(typeof move.power, "number");
        assert.equal(typeof move.PP, "number");
        assert.equal(typeof move.priority, "number");
        assert.ok(Array.isArray(move.flags), `${key}.flags nao e array`);
        assert.ok(Array.isArray(move.description));
    }
});
