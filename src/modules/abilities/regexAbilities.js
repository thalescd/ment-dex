// Parser para o formato pokeemerald-expansion (gAbilitiesInfo struct)

export function parseAbilitiesInfo(text) {
    const abilities = {};
    let idx = 0;

    // Regex para capturar cada bloco [ABILITY_XXX] = { ... }
    // Suporta um nivel de chaves aninhadas (ex: nested structs)
    const blockRegex =
        /\[(ABILITY_\w+)\]\s*=\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g;

    let match;
    while ((match = blockRegex.exec(text)) !== null) {
        const abilityKey = match[1];
        const body = match[2];

        // Extrair .name = _("...") → ingameName
        const nameMatch = body.match(/\.name\s*=\s*_\(\s*"([^"]*)"\s*\)/);
        const ingameName = nameMatch ? nameMatch[1] : "";

        // Extrair .description = COMPOUND_STRING(...)
        // Suporta multi-line: COMPOUND_STRING("line1\n" "line2")
        const descMatch = body.match(
            /\.description\s*=\s*COMPOUND_STRING\(([\s\S]*?)\)/
        );
        let description = "";
        if (descMatch) {
            // Extrair todas as strings entre aspas e concatenar
            const parts = [];
            const strRegex = /"([^"]*)"/g;
            let strMatch;
            while ((strMatch = strRegex.exec(descMatch[1])) !== null) {
                parts.push(strMatch[1]);
            }
            description = parts.join("").replace(/\\n/g, " ");
        }

        abilities[abilityKey] = {
            name: abilityKey,
            ingameName: ingameName,
            description: description,
            id: idx++,
        };
    }

    return abilities;
}
