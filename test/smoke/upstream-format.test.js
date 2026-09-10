// Smoke test contra o pokeemerald-expansion REAL.
//
// Os testes unitarios usam fixtures congeladas, e por isso pegam regressao no
// parser (voce editou um regex e quebrou) mas NAO pegam mudanca de formato no
// upstream — uma fixture do formato antigo passa feliz enquanto o GitHub muda.
// Este arquivo cobre o segundo caso, e por isso depende de rede: nao roda em
// PR, roda agendado.
//
// As assercoes sao LIMIARES, nao valores exatos: a intencao e detectar
// "o parser parou de casar", nao "entrou um Pokemon novo".

import { test } from "node:test";
import assert from "node:assert/strict";
import { dataSources } from "../../src/utils/config.js";
import {
    parseSpeciesConstants,
    parseSpeciesInfo,
    parseLevelUpLearnsets,
    parseEggMoves,
    parseTmsHms,
    parseSpriteRefs,
} from "../../src/modules/species/regexSpecies.js";
import { parseMovesInfo } from "../../src/modules/moves/regexMoves.js";
import { parseAbilitiesInfo } from "../../src/modules/abilities/regexAbilities.js";

async function get(url) {
    const response = await fetch(url);
    assert.ok(response.ok, `HTTP ${response.status} em ${url}`);
    return response.text();
}

test("species.h ainda rende a dex inteira", async () => {
    // O bug real: o upstream trocou "#define SPECIES_X 1" pelo "enum Species"
    // e este numero caiu de 1671 para 1.
    const constants = parseSpeciesConstants(
        await get(dataSources.speciesConstants)
    );
    const count = Object.keys(constants).length;
    assert.ok(
        count > 1000,
        `so ${count} constantes de especie — o formato de species.h provavelmente mudou`
    );
});

test("species_info rende dados para as especies", async () => {
    const data = {};
    for (const url of dataSources.speciesInfo) {
        Object.assign(data, parseSpeciesInfo(await get(url)).data);
    }
    const count = Object.keys(data).length;
    assert.ok(count > 1000, `so ${count} entradas em species_info`);

    const bulbasaur = data.SPECIES_BULBASAUR;
    assert.ok(bulbasaur, "SPECIES_BULBASAUR ausente");
    assert.ok(
        bulbasaur.baseHP > 0,
        "baseHP zerado — macros de stat nao resolveram"
    );
    assert.match(bulbasaur.type1, /^TYPE_/);
    assert.ok(bulbasaur.abilities.length >= 1);
    assert.ok(bulbasaur.speciesName.length > 0);

    // Nenhuma especie deve sair sem tipo: foi assim que Togepi quebrou quando
    // o tipo passou a vir de uma macro com ternario.
    const typeless = Object.keys(data).filter((k) => !data[k].type1);
    assert.equal(
        typeless.length,
        0,
        `especies sem type1: ${typeless.slice(0, 5).join(", ")}`
    );
});

test("as constantes de especie casam com o species_info", async () => {
    // Pega o caso em que os dois parsers funcionam mas deixam de se encontrar:
    // fetchSpecies descarta silenciosamente toda constante sem entrada aqui.
    const constants = parseSpeciesConstants(
        await get(dataSources.speciesConstants)
    );
    const data = {};
    for (const url of dataSources.speciesInfo) {
        Object.assign(data, parseSpeciesInfo(await get(url)).data);
    }
    const matched = Object.keys(constants).filter((name) => data[name]).length;
    assert.ok(
        matched > 1000,
        `so ${matched} constantes tem entrada em species_info`
    );
});

test("learnsets, tms e sprites continuam sendo extraidos", async () => {
    const levelUp = parseLevelUpLearnsets(
        await get(dataSources.levelUpLearnsets)
    );
    assert.ok(
        Object.keys(levelUp).length > 500,
        `so ${Object.keys(levelUp).length} level-up learnsets`
    );

    const eggMoves = parseEggMoves(await get(dataSources.eggMoves));
    assert.ok(
        Object.keys(eggMoves).length > 200,
        `so ${Object.keys(eggMoves).length} egg move learnsets`
    );

    const tmhm = parseTmsHms(await get(dataSources.tmsHms));
    assert.ok(tmhm.size > 50, `so ${tmhm.size} moves de TM/HM`);

    const sprites = parseSpriteRefs(await get(dataSources.pokemonGraphics));
    assert.ok(
        Object.keys(sprites).length > 1000,
        `so ${Object.keys(sprites).length} refs de sprite`
    );
});

test("moves_info e abilities continuam sendo extraidos", async () => {
    const moves = parseMovesInfo(await get(dataSources.movesInfo));
    assert.ok(
        Object.keys(moves).length > 700,
        `so ${Object.keys(moves).length} moves`
    );
    assert.equal(moves.MOVE_POUND?.ingameName, "Pound");

    const abilities = parseAbilitiesInfo(await get(dataSources.abilitiesInfo));
    assert.ok(
        Object.keys(abilities).length > 250,
        `so ${Object.keys(abilities).length} abilities`
    );
    assert.ok(abilities.ABILITY_STENCH?.description.length > 0);
});

test("all_learnables.json casa com as chaves de especie", async () => {
    const response = await fetch(dataSources.teachableLearnsets);
    assert.ok(response.ok, `HTTP ${response.status}`);
    const teachable = await response.json();

    assert.ok(
        Object.keys(teachable).length > 800,
        `so ${Object.keys(teachable).length} entradas`
    );
    // As chaves vem sem o prefixo SPECIES_; fetchSpecies conta com isso.
    assert.ok(
        Array.isArray(teachable.BULBASAUR),
        "chave BULBASAUR ausente — o formato das chaves pode ter mudado"
    );
});

test("wild_encounters.json mantem a forma que fetchLocations espera", async () => {
    const response = await fetch(dataSources.wildEncountersJson);
    assert.ok(response.ok, `HTTP ${response.status}`);
    const json = await response.json();

    const group = json.wild_encounter_groups?.[0];
    assert.ok(group, "wild_encounter_groups[0] ausente");
    assert.ok(Array.isArray(group.fields), "group.fields ausente");
    assert.ok(group.encounters?.length > 100, "poucos encounters");
    assert.ok(
        group.encounters[0].map?.startsWith("MAP_"),
        "campo `map` ausente"
    );

    const fishing = group.fields.find((f) => f.type === "fishing_mons");
    assert.ok(fishing?.groups, "fishing_mons.groups ausente — os rods quebram");
});
