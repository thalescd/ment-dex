import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../fixtures/load.js";
import {
    parseSpeciesConstants,
    parseSpeciesInfo,
    parseLevelUpLearnsets,
    parseEggMoves,
    parseTmsHms,
    parseSpriteRefs,
    parseFormSpeciesTables,
} from "../../src/modules/species/regexSpecies.js";

// ---------------------------------------------------------------------------
// parseSpeciesConstants
//
// Este e o parser que quebrou quando o upstream trocou "#define SPECIES_X 1"
// pelo "enum Species". Ele achava 1 especie em vez de 1671 e a dex ficava
// vazia. Os testes abaixo travam os dois formatos.
// ---------------------------------------------------------------------------

test("parseSpeciesConstants: le o enum e resolve os tres formatos de entrada", () => {
    const species = parseSpeciesConstants(fixture("species_enum.h"));

    // valor explicito
    assert.equal(species.SPECIES_BULBASAUR.ID, 1);
    // valor implicito (anterior + 1)
    assert.equal(species.SPECIES_IVYSAUR.ID, 2, "incremento implicito");
    assert.equal(species.SPECIES_VENUSAUR.ID, 3);
    // alias cujo alvo aparece DEPOIS dele no arquivo
    assert.equal(
        species.SPECIES_CASTFORM.ID,
        species.SPECIES_CASTFORM_NORMAL.ID,
        "alias com referencia para frente"
    );
    // valor implicito depois de um alias
    assert.equal(species.SPECIES_PYROAR_F.ID, 1001);

    assert.equal(typeof species.SPECIES_BULBASAUR.name, "string");
    for (const [key, value] of Object.entries(species)) {
        assert.ok(Number.isInteger(value.ID), `${key} sem ID inteiro`);
    }
});

test("parseSpeciesConstants: marcadores do enum nao viram especies", () => {
    const species = parseSpeciesConstants(fixture("species_enum.h"));
    for (const marker of [
        "NUM_SPECIES",
        "SPECIES_EGG",
        "SPECIES_CUSTOM_START",
        "SPECIES_CUSTOM_END",
        "SPECIES_SHINY_TAG",
    ]) {
        assert.ok(!(marker in species), `${marker} nao deveria estar aqui`);
    }
});

test("parseSpeciesConstants: ainda le o formato antigo com #define", () => {
    const species = parseSpeciesConstants(fixture("species_defines.h"));
    assert.equal(species.SPECIES_BULBASAUR.ID, 1);
    assert.equal(species.SPECIES_VENUSAUR.ID, 3);
    assert.ok(!("SPECIES_SHINY_TAG" in species));
});

// ---------------------------------------------------------------------------
// parseSpeciesInfo
// ---------------------------------------------------------------------------

test("parseSpeciesInfo: extrai a familia Bulbasaur inteira", () => {
    const { data, families } = parseSpeciesInfo(fixture("gen_1_families.h"));

    assert.deepEqual(Object.keys(families), ["P_FAMILY_BULBASAUR"]);
    assert.ok(
        families.P_FAMILY_BULBASAUR.includes("SPECIES_BULBASAUR"),
        "a familia deve listar seus membros"
    );

    const bulbasaur = data.SPECIES_BULBASAUR;
    assert.ok(bulbasaur, "SPECIES_BULBASAUR ausente");
    assert.equal(bulbasaur.speciesName, "Bulbasaur");
    assert.equal(bulbasaur.baseHP, 45);
    assert.equal(bulbasaur.type1, "TYPE_GRASS");
    assert.equal(bulbasaur.type2, "TYPE_POISON");
    assert.ok(bulbasaur.abilities.includes("ABILITY_OVERGROW"));
    assert.equal(bulbasaur.eggGroup1, "EGG_GROUP_MONSTER");
    assert.equal(bulbasaur.levelUpRef, "sBulbasaurLevelUpLearnset");
    assert.equal(bulbasaur.eggMoveRef, "sBulbasaurEggMoveLearnset");
    assert.equal(bulbasaur.frontPicRef, "gMonFrontPic_Bulbasaur");
    assert.deepEqual(bulbasaur.evolution, [
        ["EVO_LEVEL", "16", "SPECIES_IVYSAUR"],
    ]);
});

test("parseSpeciesInfo: stats atras de ternario resolvem para o ramo atualizado", () => {
    const { data } = parseSpeciesInfo(fixture("gen_1_families.h"));
    // .baseSpAttack = P_UPDATED_STATS >= GEN_6 ? 100 : 80
    assert.ok(
        data.SPECIES_VENUSAUR.baseSpAttack > 0,
        "ternario em base stat nao resolveu"
    );
});

test("parseSpeciesInfo: tipo definido por macro com ternario e resolvido", () => {
    // Regressao: MON_TYPES(TOGEPI_FAMILY_TYPE1) deixava Togepi sem tipo, e
    // MON_TYPES(TOGEPI_FAMILY_TYPE1, TYPE_FLYING) fazia Togetic virar
    // Flying/Flying em vez de Fairy/Flying.
    const { data } = parseSpeciesInfo(fixture("gen_2_families.h"));

    assert.equal(data.SPECIES_TOGEPI.type1, "TYPE_FAIRY");
    assert.equal(data.SPECIES_TOGEPI.type2, "TYPE_FAIRY", "tipo unico duplica");
    assert.equal(data.SPECIES_TOGETIC.type1, "TYPE_FAIRY");
    assert.equal(data.SPECIES_TOGETIC.type2, "TYPE_FLYING");

    for (const [key, value] of Object.entries(data)) {
        assert.match(value.type1, /^TYPE_/, `${key} sem type1 valido`);
    }
});

// ---------------------------------------------------------------------------
// learnsets, tms, sprites, formas
// ---------------------------------------------------------------------------

test("parseLevelUpLearnsets: pares [move, nivel] plausiveis", () => {
    const learnsets = parseLevelUpLearnsets(fixture("level_up_learnsets.h"));
    const bulbasaur = learnsets.sBulbasaurLevelUpLearnset;

    assert.ok(bulbasaur?.length > 0, "learnset do Bulbasaur vazio");
    for (const [move, level] of bulbasaur) {
        assert.match(move, /^MOVE_/);
        assert.ok(level >= 1 && level <= 100, `nivel fora da faixa: ${level}`);
    }
    assert.deepEqual(bulbasaur[0], ["MOVE_TACKLE", 1]);
});

test("parseEggMoves: lista de moves ate MOVE_UNAVAILABLE", () => {
    const learnsets = parseEggMoves(fixture("egg_moves.h"));
    const bulbasaur = learnsets.sBulbasaurEggMoveLearnset;

    assert.ok(bulbasaur?.length > 0);
    assert.ok(!bulbasaur.includes("MOVE_UNAVAILABLE"), "terminador vazou");
    for (const move of bulbasaur) assert.match(move, /^MOVE_/);
});

test("parseTmsHms: devolve um Set de MOVE_*", () => {
    const tmhm = parseTmsHms(fixture("tms_hms.h"));

    assert.ok(tmhm instanceof Set);
    assert.ok(tmhm.size > 50, `so ${tmhm.size} moves de TM/HM`);
    for (const move of tmhm) assert.match(move, /^MOVE_/);
});

test("parseSpriteRefs: primeira ocorrencia vence (sprite novo, nao o GBA)", () => {
    const refs = parseSpriteRefs(fixture("graphics_pokemon.h"));
    const bulbasaur = refs.gMonFrontPic_Bulbasaur;

    assert.ok(bulbasaur, "ref do Bulbasaur ausente");
    assert.ok(
        bulbasaur.endsWith("graphics/pokemon/bulbasaur/anim_front.png"),
        `caminho inesperado: ${bulbasaur}`
    );
    assert.ok(!bulbasaur.includes("_gba"), "peguei a variante GBA");
});

test("parseFormSpeciesTables: classifica base, mega e gigantamax", () => {
    const forms = parseFormSpeciesTables(fixture("form_species_tables.h"));

    assert.equal(forms.SPECIES_VENUSAUR, "base");
    assert.equal(forms.SPECIES_VENUSAUR_MEGA, "functional");
    assert.equal(forms.SPECIES_VENUSAUR_GMAX, "functional");
});
