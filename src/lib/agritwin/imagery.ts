const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const SHOT = {
  aerial: u("photo-1574943320219-553eb213f72d"),
  dawn: u("photo-1547471080-7cc2caa01a7e"),
  maize: u("photo-1625246333195-78d9c38ad449"),
  maizeLeaf: u("photo-1625246333195-78d9c38ad449"),
  beans: u("photo-1597362925123-77861d3fbac7"),
  avocado: u("photo-1601039641847-7857b994af07"),
  coffee: u("photo-1447933601403-0c6688de566e"),
  tea: u("photo-1564890369478-c89ca6d9cde9"),
  marketNairobi: u("photo-1488459716781-31db52582fe9"),
  marketThika: u("photo-1542838132-92c53300491e"),
  marketNakuru: u("photo-1550989460-dc02ee67acf7"),
  marketEldoret: u("photo-1574323347407-f5e1ad6d020b"),
  grain: u("photo-1574323347407-f5e1ad6d020b"),
  farmer: u("photo-1530836369256-d09cce601a3f"),
  harvest: u("photo-1564890369478-c89ca6d9cde9"),
  hands: u("photo-1530836369256-d09cce601a3f"),
};

export const STOCK: string[] = [
  ...new Set([
    u("photo-1547471080-7cc2caa01a7e"),
    u("photo-1489392191049-581efcb19c36"),
    u("photo-1516026672322-bc52d61a55d5"),
    u("photo-1509099836639-7b0cd47535a5"),
    SHOT.maizeLeaf,
    SHOT.aerial,
    SHOT.tea,
    SHOT.coffee,
    SHOT.farmer,
    SHOT.marketNairobi,
    SHOT.marketThika,
    SHOT.marketNakuru,
    SHOT.grain,
    u("photo-1592982537447-7440770cbfc1"),
    u("photo-1605000797499-95a51c5269ae"),
    u("photo-1560493676-04071c5f73a7"),
    u("photo-1597362925123-77861d3fbac7"),
    u("photo-1550989460-dc02ee67acf7"),
    u("photo-1589923188900-8bbe77023c75"),
  ]),
];

export const MARKET_REEL = [
  { src: SHOT.marketNairobi, place: "Marikiti stall" },
  { src: SHOT.marketThika, place: "Crate weigh" },
  { src: SHOT.grain, place: "Grain sacks" },
  { src: SHOT.maizeLeaf, place: "Maize rows" },
  { src: SHOT.tea, place: "Tea lots" },
  { src: SHOT.farmer, place: "Field walk" },
  { src: SHOT.dawn, place: "Homestead" },
  { src: SHOT.coffee, place: "Coffee lots" },
];

export const MARKET_SRCS = MARKET_REEL.map((s) => s.src);

export const CROP_SHOT: Record<string, string> = {
  "White Maize": SHOT.maize,
  "Rosecoco Beans": SHOT.beans,
  "Hass Avocado": SHOT.avocado,
  Coffee: SHOT.coffee,
  Tea: SHOT.tea,
};

export function cropShot(crop: string) {
  return CROP_SHOT[crop] || SHOT.maize;
}

export function marketShot(town: string) {
  if (town.includes("Nairobi")) return SHOT.marketNairobi;
  if (town.includes("Thika")) return SHOT.marketThika;
  if (town.includes("Nakuru")) return SHOT.marketNakuru;
  if (town.includes("Eldoret")) return SHOT.marketEldoret;
  return SHOT.grain;
}

export function lenderShot(type: string) {
  if (type === "SACCO") return SHOT.harvest;
  if (type === "Cooperative") return SHOT.coffee;
  return SHOT.farmer;
}
