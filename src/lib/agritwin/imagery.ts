export const SHOT = {
  aerial:
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1800&q=80",
  dawn:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80",
  maize:
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1600&q=80",
  maizeLeaf:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=80",
  beans:
    "https://images.unsplash.com/photo-1567375698348-5dfe60e1dca8?auto=format&fit=crop&w=1400&q=80",
  avocado:
    "https://images.unsplash.com/photo-1601039641847-7857b994af07?auto=format&fit=crop&w=1400&q=80",
  coffee:
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=80",
  tea:
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1400&q=80",
  marketNairobi:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=80",
  marketThika:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80",
  marketNakuru:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80",
  marketEldoret:
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1400&q=80",
  grain:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1400&q=80",
  farmer:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80",
  harvest:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80",
  hands:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80",
};

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
