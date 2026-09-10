#if P_FAMILY_BULBASAUR
#if !P_GBA_STYLE_SPECIES_GFX
    const u32 gMonFrontPic_Bulbasaur[] = INCGFX_U32("graphics/pokemon/bulbasaur/anim_front.png", ".4bpp.smol");
    const u16 gMonPalette_Bulbasaur[] = INCGFX_U16("graphics/pokemon/bulbasaur/normal.pal", ".gbapal");
    const u32 gMonBackPic_Bulbasaur[] = INCGFX_U32("graphics/pokemon/bulbasaur/back.png", ".4bpp.smol");
    const u16 gMonShinyPalette_Bulbasaur[] = INCGFX_U16("graphics/pokemon/bulbasaur/shiny.pal", ".gbapal");
#else
    const u32 gMonFrontPic_Bulbasaur[] = INCGFX_U32("graphics/pokemon/bulbasaur/anim_front_gba.png", ".4bpp.smol");
    const u16 gMonPalette_Bulbasaur[] = INCGFX_U16("graphics/pokemon/bulbasaur/normal_gba.pal", ".gbapal");
    const u32 gMonBackPic_Bulbasaur[] = INCGFX_U32("graphics/pokemon/bulbasaur/back_gba.png", ".4bpp.smol");
    const u16 gMonShinyPalette_Bulbasaur[] = INCGFX_U16("graphics/pokemon/bulbasaur/shiny_gba.pal", ".gbapal");
#endif //P_GBA_STYLE_SPECIES_GFX
#if !P_GBA_STYLE_SPECIES_ICONS
    const u8 gMonIcon_Bulbasaur[] = INCGFX_U8("graphics/pokemon/bulbasaur/icon.png", ".4bpp");
#else
    const u8 gMonIcon_Bulbasaur[] = INCGFX_U8("graphics/pokemon/bulbasaur/icon_gba.png", ".4bpp");
#endif //P_GBA_STYLE_SPECIES_ICONS
#if P_FOOTPRINTS
    const u8 gMonFootprint_Bulbasaur[] = INCGFX_U8("graphics/pokemon/bulbasaur/footprint.png", ".1bpp");
#endif //P_FOOTPRINTS
#if OW_POKEMON_OBJECT_EVENTS
    const u32 gObjectEventPic_Bulbasaur[] = INCGFX_COMP("graphics/pokemon/bulbasaur/overworld.png", ".4bpp", "-mwidth 4 -mheight 4");
#if OW_PKMN_OBJECTS_SHARE_PALETTES == FALSE
    const u16 gOverworldPalette_Bulbasaur[] = INCGFX_U16("graphics/pokemon/bulbasaur/overworld_normal.pal", ".gbapal");
    const u16 gShinyOverworldPalette_Bulbasaur[] = INCGFX_U16("graphics/pokemon/bulbasaur/overworld_shiny.pal", ".gbapal");
#endif //OW_PKMN_OBJECTS_SHARE_PALETTES
#endif //OW_POKEMON_OBJECT_EVENTS

#if !P_GBA_STYLE_SPECIES_GFX
    const u32 gMonFrontPic_Ivysaur[] = INCGFX_U32("graphics/pokemon/ivysaur/anim_front.png", ".4bpp.smol");
    const u16 gMonPalette_Ivysaur[] = INCGFX_U16("graphics/pokemon/ivysaur/normal.pal", ".gbapal");
    const u32 gMonBackPic_Ivysaur[] = INCGFX_U32("graphics/pokemon/ivysaur/back.png", ".4bpp.smol");
    const u16 gMonShinyPalette_Ivysaur[] = INCGFX_U16("graphics/pokemon/ivysaur/shiny.pal", ".gbapal");
#else
    const u32 gMonFrontPic_Ivysaur[] = INCGFX_U32("graphics/pokemon/ivysaur/anim_front_gba.png", ".4bpp.smol");
    const u16 gMonPalette_Ivysaur[] = INCGFX_U16("graphics/pokemon/ivysaur/normal_gba.pal", ".gbapal");
    const u32 gMonBackPic_Ivysaur[] = INCGFX_U32("graphics/pokemon/ivysaur/back_gba.png", ".4bpp.smol");
    const u16 gMonShinyPalette_Ivysaur[] = INCGFX_U16("graphics/pokemon/ivysaur/shiny_gba.pal", ".gbapal");
#endif //P_GBA_STYLE_SPECIES_GFX
#if !P_GBA_STYLE_SPECIES_ICONS
    const u8 gMonIcon_Ivysaur[] = INCGFX_U8("graphics/pokemon/ivysaur/icon.png", ".4bpp");
#else
    const u8 gMonIcon_Ivysaur[] = INCGFX_U8("graphics/pokemon/ivysaur/icon_gba.png", ".4bpp");
#endif //P_GBA_STYLE_SPECIES_ICONS
#if P_FOOTPRINTS
    const u8 gMonFootprint_Ivysaur[] = INCGFX_U8("graphics/pokemon/ivysaur/footprint.png", ".1bpp");
#endif //P_FOOTPRINTS
#if OW_POKEMON_OBJECT_EVENTS
    const u32 gObjectEventPic_Ivysaur[] = INCGFX_COMP("graphics/pokemon/ivysaur/overworld.png", ".4bpp", "-mwidth 4 -mheight 4");
#if OW_PKMN_OBJECTS_SHARE_PALETTES == FALSE
    const u16 gOverworldPalette_Ivysaur[] = INCGFX_U16("graphics/pokemon/ivysaur/overworld_normal.pal", ".gbapal");
    const u16 gShinyOverworldPalette_Ivysaur[] = INCGFX_U16("graphics/pokemon/ivysaur/overworld_shiny.pal", ".gbapal");
#endif //OW_PKMN_OBJECTS_SHARE_PALETTES
#endif //OW_POKEMON_OBJECT_EVENTS

#if !P_GBA_STYLE_SPECIES_GFX
    const u32 gMonFrontPic_Venusaur[] = INCGFX_U32("graphics/pokemon/venusaur/anim_front.png", ".4bpp.smol");
    const u16 gMonPalette_Venusaur[] = INCGFX_U16("graphics/pokemon/venusaur/normal.pal", ".gbapal");
    const u32 gMonBackPic_Venusaur[] = INCGFX_U32("graphics/pokemon/venusaur/back.png", ".4bpp.smol");
    const u16 gMonShinyPalette_Venusaur[] = INCGFX_U16("graphics/pokemon/venusaur/shiny.pal", ".gbapal");
#else
    const u32 gMonFrontPic_Venusaur[] = INCGFX_U32("graphics/pokemon/venusaur/anim_front_gba.png", ".4bpp.smol");
    const u16 gMonPalette_Venusaur[] = INCGFX_U16("graphics/pokemon/venusaur/normal_gba.pal", ".gbapal");
    const u32 gMonBackPic_Venusaur[] = INCGFX_U32("graphics/pokemon/venusaur/back_gba.png", ".4bpp.smol");
    const u16 gMonShinyPalette_Venusaur[] = INCGFX_U16("graphics/pokemon/venusaur/shiny_gba.pal", ".gbapal");
#endif //P_GBA_STYLE_SPECIES_GFX
#if !P_GBA_STYLE_SPECIES_ICONS
    const u8 gMonIcon_Venusaur[] = INCGFX_U8("graphics/pokemon/venusaur/icon.png", ".4bpp");
#else
    const u8 gMonIcon_Venusaur[] = INCGFX_U8("graphics/pokemon/venusaur/icon_gba.png", ".4bpp");
#endif //P_GBA_STYLE_SPECIES_ICONS
#if P_FOOTPRINTS
    const u8 gMonFootprint_Venusaur[] = INCGFX_U8("graphics/pokemon/venusaur/footprint.png", ".1bpp");
#endif //P_FOOTPRINTS
#if OW_POKEMON_OBJECT_EVENTS
    const u32 gObjectEventPic_Venusaur[] = INCGFX_COMP("graphics/pokemon/venusaur/overworld.png", ".4bpp", "-mwidth 4 -mheight 4");
#if OW_PKMN_OBJECTS_SHARE_PALETTES == FALSE
    const u16 gOverworldPalette_Venusaur[] = INCGFX_U16("graphics/pokemon/venusaur/overworld_normal.pal", ".gbapal");
    const u16 gShinyOverworldPalette_Venusaur[] = INCGFX_U16("graphics/pokemon/venusaur/overworld_shiny.pal", ".gbapal");
#endif //OW_PKMN_OBJECTS_SHARE_PALETTES
#endif //OW_POKEMON_OBJECT_EVENTS

#if P_GENDER_DIFFERENCES
    const u32 gMonFrontPic_VenusaurF[] = INCGFX_U32("graphics/pokemon/venusaur/anim_frontf.png", ".4bpp.smol");
    const u32 gMonBackPic_VenusaurF[] = INCGFX_U32("graphics/pokemon/venusaur/backf.png", ".4bpp.smol");
#if OW_POKEMON_OBJECT_EVENTS
    const u32 gObjectEventPic_VenusaurF[] = INCGFX_COMP("graphics/pokemon/venusaur/overworldf.png", ".4bpp", "-mwidth 4 -mheight 4");
#endif //OW_POKEMON_OBJECT_EVENTS
#endif //P_GENDER_DIFFERENCES

#if P_MEGA_EVOLUTIONS
    const u32 gMonFrontPic_VenusaurMega[] = INCGFX_U32("graphics/pokemon/venusaur/mega/anim_front.png", ".4bpp.smol");
    const u16 gMonPalette_VenusaurMega[] = INCGFX_U16("graphics/pokemon/venusaur/mega/normal.pal", ".gbapal");
    const u32 gMonBackPic_VenusaurMega[] = INCGFX_U32("graphics/pokemon/venusaur/mega/back.png", ".4bpp.smol");
    const u16 gMonShinyPalette_VenusaurMega[] = INCGFX_U16("graphics/pokemon/venusaur/mega/shiny.pal", ".gbapal");
    const u8 gMonIcon_VenusaurMega[] = INCGFX_U8("graphics/pokemon/venusaur/mega/icon.png", ".4bpp");
#if OW_POKEMON_OBJECT_EVENTS && OW_BATTLE_ONLY_FORMS
    const u32 gObjectEventPic_VenusaurMega[] = INCGFX_COMP("graphics/pokemon/venusaur/mega/overworld.png", ".4bpp", "-mwidth 4 -mheight 4");
#if OW_PKMN_OBJECTS_SHARE_PALETTES == FALSE
    const u16 gOverworldPalette_VenusaurMega[] = INCGFX_U16("graphics/pokemon/venusaur/mega/overworld_normal.pal", ".gbapal");
    const u16 gShinyOverworldPalette_VenusaurMega[] = INCGFX_U16("graphics/pokemon/venusaur/mega/overworld_shiny.pal", ".gbapal");
#endif //OW_PKMN_OBJECTS_SHARE_PALETTES
#endif //OW_POKEMON_OBJECT_EVENTS && OW_BATTLE_ONLY_FORMS
#endif //P_MEGA_EVOLUTIONS

#if P_GIGANTAMAX_FORMS
    const u32 gMonFrontPic_VenusaurGmax[] = INCGFX_U32("graphics/pokemon/venusaur/gmax/front.png", ".4bpp.smol");
    const u32 gMonBackPic_VenusaurGmax[] = INCGFX_U32("graphics/pokemon/venusaur/gmax/back.png", ".4bpp.smol");
    const u16 gMonPalette_VenusaurGmax[] = INCGFX_U16("graphics/pokemon/venusaur/gmax/normal.pal", ".gbapal");
    const u16 gMonShinyPalette_VenusaurGmax[] = INCGFX_U16("graphics/pokemon/venusaur/gmax/shiny.pal", ".gbapal");
    const u8 gMonIcon_VenusaurGmax[] = INCGFX_U8("graphics/pokemon/venusaur/gmax/icon.png", ".4bpp");
#if OW_POKEMON_OBJECT_EVENTS
    // const u32 gObjectEventPic_VenusaurGmax[] = INCGFX_COMP("graphics/pokemon/venusaur/gmax/overworld.png", ".4bpp");
#if OW_PKMN_OBJECTS_SHARE_PALETTES == FALSE
    // const u16 gOverworldPalette_VenusaurGmax[] = INCGFX_U16("graphics/pokemon/venusaur/gmax/overworld_normal.pal", ".gbapal");
    // const u16 gShinyOverworldPalette_VenusaurGmax[] = INCGFX_U16("graphics/pokemon/venusaur/gmax/overworld_shiny.pal", ".gbapal");
#endif //OW_PKMN_OBJECTS_SHARE_PALETTES
#endif //OW_POKEMON_OBJECT_EVENTS
#endif //P_GIGANTAMAX_FORMS
#endif //P_FAMILY_BULBASAUR
