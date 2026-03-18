// Parser para o formato pokeemerald-expansion (gMovesInfo struct)

// Mapeamento de campos boolean do expansion para FLAG_* do display
const BOOL_TO_FLAG = {
    makesContact: "FLAG_MAKES_CONTACT",
    soundMove: "FLAG_SOUND",
    ballisticMove: "FLAG_BALLISTIC",
    powderMove: "FLAG_POWDER",
    punchingMove: "FLAG_IRON_FIST",
    bitingMove: "FLAG_STRONG_JAW",
    pulseMove: "FLAG_MEGA_LAUNCHER",
    slicingMove: "FLAG_SLICING",
    windMove: "FLAG_WIND",
    healingMove: "FLAG_TRIAGE",
    danceMove: "FLAG_DANCE",
    snatchAffected: "FLAG_SNATCH_AFFECTED",
    magicCoatAffected: "FLAG_MAGIC_COAT_AFFECTED",
    ignoresProtect: "FLAG_IGNORES_PROTECT",
    ignoresSubstitute: "FLAG_IGNORES_SUBSTITUTE",
    damagesAirborne: "FLAG_DAMAGES_AIRBORNE",
    damagesAirborneDoubleDamage: "FLAG_DAMAGES_AIRBORNE_DOUBLE_DAMAGE",
    damagesUnderwater: "FLAG_DAMAGES_UNDERWATER",
    damagesUnderground: "FLAG_DAMAGES_UNDERGROUND",
    minimizeDoubleDamage: "FLAG_MINIMIZE_DOUBLE_DAMAGE",
    gravityBanned: "FLAG_GRAVITY_BANNED",
    alwaysHitsInHailSnow: "FLAG_ALWAYS_HITS_IN_HAIL_SNOW",
    alwaysHitsInRain: "FLAG_ALWAYS_HITS_IN_RAIN",
};

// Mapeamento de DAMAGE_CATEGORY_* para SPLIT_*
const CATEGORY_TO_SPLIT = {
    DAMAGE_CATEGORY_PHYSICAL: "SPLIT_PHYSICAL",
    DAMAGE_CATEGORY_SPECIAL: "SPLIT_SPECIAL",
    DAMAGE_CATEGORY_STATUS: "SPLIT_STATUS",
};

// Extrai todas as strings entre aspas e junta, substituindo \n por espaco
function extractCompoundString(raw) {
    const parts = [];
    const strRegex = /"([^"]*)"/g;
    let m;
    while ((m = strRegex.exec(raw)) !== null) {
        parts.push(m[1]);
    }
    return parts.join("").replace(/\\n/g, " ");
}

// Resolve valor inteiro que pode ser ternario: "B_UPDATED >= GEN_6 ? 90 : 95" → 90
function resolveInt(raw) {
    const trimmed = raw.trim();
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed);
    const ternary = trimmed.match(/\?\s*(-?\d+)/);
    if (ternary) return parseInt(ternary[1]);
    return 0;
}

// Resolve valor string que pode ser ternario: "B_UPDATED >= GEN_2 ? TYPE_FIGHTING : TYPE_NORMAL" → "TYPE_FIGHTING"
function resolveStr(raw, prefix) {
    const trimmed = raw.trim();
    const re = new RegExp(`${prefix}\\w+`);
    const direct = trimmed.match(re);
    if (direct && trimmed.startsWith(prefix)) return direct[0];
    // Ternario: pegar o primeiro match do prefix apos o "?"
    const afterQ = trimmed.indexOf("?");
    if (afterQ !== -1) {
        const afterTernary = trimmed.substring(afterQ + 1);
        const m = afterTernary.match(re);
        if (m) return m[0];
    }
    return direct ? direct[0] : "";
}

export function parseMovesInfo(text) {
    const moves = {};
    let idx = 0;

    // Regex para capturar cada bloco [MOVE_XXX] = { ... }
    // Suporta chaves aninhadas de um nivel (ex: .additionalEffects, .contestComboMoves)
    const blockRegex =
        /\[(MOVE_\w+)\]\s*=\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g;

    let match;
    while ((match = blockRegex.exec(text)) !== null) {
        const moveKey = match[1];
        const body = match[2];

        // ingameName: .name = COMPOUND_STRING("Pound")
        const nameMatch = body.match(
            /\.name\s*=\s*COMPOUND_STRING\(\s*"([^"]*)"/
        );
        const ingameName = nameMatch ? nameMatch[1] : "";

        // description: COMPOUND_STRING(...) — pode ser multi-line
        const descMatch = body.match(
            /\.description\s*=\s*COMPOUND_STRING\(([\s\S]*?)\)(?:\s*,)/
        );
        const description = descMatch
            ? [extractCompoundString(descMatch[1])]
            : [];

        // Campos numericos (suportam ternarios: B_UPDATED >= GEN_X ? val1 : val2)
        const powerRaw = body.match(/\.power\s*=\s*([^,\n]+)/);
        const ppRaw = body.match(/\.pp\s*=\s*([^,\n]+)/);
        const accuracyRaw = body.match(/\.accuracy\s*=\s*([^,\n]+)/);
        const priorityRaw = body.match(/\.priority\s*=\s*([^,\n]+)/);

        // Campos string (suportam ternarios: B_UPDATED >= GEN_X ? TYPE_X : TYPE_Y)
        const typeRaw = body.match(/\.type\s*=\s*([^,\n]+)/);
        const effectRaw = body.match(/\.effect\s*=\s*([^,\n]+)/);
        const targetRaw = body.match(/\.target\s*=\s*([^,\n]+)/);

        // Category → Split
        const categoryRaw = body.match(/\.category\s*=\s*([^,\n]+)/);
        const split = categoryRaw
            ? CATEGORY_TO_SPLIT[resolveStr(categoryRaw[1], "DAMAGE_CATEGORY_")] || ""
            : "";

        // Chance (de additionalEffects)
        const chanceMatch = body.match(/\.chance\s*=\s*(\d+)/);
        const chance = chanceMatch ? parseInt(chanceMatch[1]) : 0;

        // Flags: campos boolean = TRUE mapeados para FLAG_*
        const flags = [];
        const boolRegex = /\.(\w+)\s*=\s*TRUE/g;
        let boolMatch;
        while ((boolMatch = boolRegex.exec(body)) !== null) {
            const fieldName = boolMatch[1];
            if (BOOL_TO_FLAG[fieldName]) {
                flags.push(BOOL_TO_FLAG[fieldName]);
            }
        }
        if (flags.length === 0) flags.push("");

        moves[moveKey] = {
            name: moveKey,
            id: idx++,
            ingameName: ingameName,
            description: description,
            power: powerRaw ? resolveInt(powerRaw[1]) : 0,
            PP: ppRaw ? resolveInt(ppRaw[1]) : 0,
            type: typeRaw ? resolveStr(typeRaw[1], "TYPE_") : "",
            accuracy: accuracyRaw ? resolveInt(accuracyRaw[1]) : 0,
            split: split,
            effect: effectRaw ? resolveStr(effectRaw[1], "EFFECT_") : "",
            chance: chance,
            target: targetRaw ? resolveStr(targetRaw[1], "MOVE_TARGET_") : "",
            priority: priorityRaw ? resolveInt(priorityRaw[1]) : 0,
            flags: flags,
            Zpower: 0,
            Zeffect: "",
            maxPower: "",
            changes: [],
        };
    }

    return moves;
}
