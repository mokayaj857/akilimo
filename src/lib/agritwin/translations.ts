import { LanguageCode } from "./types";

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  dashboard: string;
  digitalTwin: string;
  cropHealth: string;
  satelliteData: string;
  soilSensors: string;
  marketPrices: string;
  saccoFinance: string;
  farmAssistant: string;
  alertsCenter: string;
  activityLog: string;
  settings: string;
  listen: string;
  stopListening: string;
  diagnosePhoto: string;
  highRiskAlert: string;
  weatherSummary: string;
  viewDetails: string;
  takeAction: string;
  applyForLoan: string;
  compareMarkets: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "Akilimo",
    tagline: "Smallholder Digital Twin & AgriFin Assistant",
    dashboard: "Overview",
    digitalTwin: "3D Farm Model",
    cropHealth: "Crop Health & Disease",
    satelliteData: "Satellite Analytics",
    soilSensors: "Soil & IoT Sensors",
    marketPrices: "Market Intelligence",
    saccoFinance: "SACCO Financing",
    farmAssistant: "AI Farm Assistant",
    alertsCenter: "Alerts Center",
    activityLog: "Activity Logbook",
    settings: "Farm Settings",
    listen: "Listen (Audio)",
    stopListening: "Stop Audio",
    diagnosePhoto: "Diagnose Leaf Photo",
    highRiskAlert: "High Risk Disease Alert",
    weatherSummary: "Weather & Moisture",
    viewDetails: "View Details",
    takeAction: "Take Action",
    applyForLoan: "Apply via SACCO",
    compareMarkets: "Compare Kenyan Markets",
  },
  sw: {
    appName: "Akilimo",
    tagline: "Msaidizi wa Kidijitali na Fedha za Kilimo",
    dashboard: "Muhtasari wa Shamba",
    digitalTwin: "Mfano wa 3D wa Shamba",
    cropHealth: "Afya ya Mazao na Magonjwa",
    satelliteData: "Takwimu za Satelaiti",
    soilSensors: "Unyevunyevu wa Udongo",
    marketPrices: "Bei za Masoko ya Kenya",
    saccoFinance: "Mikopo ya SACCO",
    farmAssistant: "Msaidizi wa Kilimo",
    alertsCenter: "Tahadhari za Shamba",
    activityLog: "Kitabu cha Shughuli",
    settings: "Mipangilio ya Shamba",
    listen: "Sikiliza kwa Sauti",
    stopListening: "Simamisha Sauti",
    diagnosePhoto: "Piga Picha ya Jani Kujua Ugonjwa",
    highRiskAlert: "Tahadhari Kubwa ya Ugonjwa",
    weatherSummary: "Hali ya Hewa na Mvua",
    viewDetails: "Tazama Zaidi",
    takeAction: "Chukua Hatua Sasa",
    applyForLoan: "Omba Mkopo wa SACCO",
    compareMarkets: "Linganisha Masoko",
  },
  kik: {
    appName: "Akilimo",
    tagline: "Mũteithia wa Ũrĩmi na Kĩhũti kĩa Mbeca",
    dashboard: "Mũgũnda Wakwa",
    digitalTwin: "Mbica ya 3D ya Mũgũnda",
    cropHealth: "Ũgima wa Mĩmera",
    satelliteData: "Ũhoro wa Mathatellite",
    soilSensors: "Ũrugarĩ wa Tĩĩri",
    marketPrices: "Thogora wa Thoko",
    saccoFinance: "Mbeca cia SACCO",
    farmAssistant: "Mũteithia wa Ũrĩmi",
    alertsCenter: "Mĩkaana ya Mũgũnda",
    activityLog: "Ibuku rĩa Mawĩra",
    settings: "Mĩbango ya Mũgũnda",
    listen: "Thikĩrĩria",
    stopListening: "Tiga Gũthikĩrĩria",
    diagnosePhoto: "Hũra Mbica ya Ithangũ",
    highRiskAlert: "Mũkaana Mũnene wa Mũrimũ",
    weatherSummary: "Rĩera na Mbura",
    viewDetails: "Rora Maũndũ Mothe",
    takeAction: "Oya Ikinya Rĩu",
    applyForLoan: "Hoya Ndimbandu ya SACCO",
    compareMarkets: "Ringanithia Thoko",
  },
  luo: {
    appName: "Akilimo",
    tagline: "Jakony Puodho gi Omenda mag Pur",
    dashboard: "Puodho",
    digitalTwin: "Kido mar Puodho 3D",
    cropHealth: "Ngima Cham gi Tuoche",
    satelliteData: "Weche mag Satelait",
    soilSensors: "Ng'ich mar Lowo",
    marketPrices: "Nengo e Chiro",
    saccoFinance: "Gowi mag SACCO",
    farmAssistant: "Jakony Pur mar AI",
    alertsCenter: "Siem mag Puodho",
    activityLog: "Buku mar Tije",
    settings: "Chenro mag Puodho",
    listen: "Chik Iti (Winji)",
    stopListening: "Chung Wacho",
    diagnosePhoto: "Goj Picha mar Oboke",
    highRiskAlert: "Siem Maduong' mar Tuo",
    weatherSummary: "Koth gi Yamo",
    viewDetails: "Ne Weche Duto",
    takeAction: "Kaw Okang' Sani",
    applyForLoan: "Kwayo Gowi e SACCO",
    compareMarkets: "Pim Nengo mag Chiro",
  },
  kal: {
    appName: "Akilimo",
    tagline: "Kiptayat ne Konyit Mbaret ak Kandoinatet",
    dashboard: "Mbaret Nyo",
    digitalTwin: "Picha nebo 3D nebo Mbaret",
    cropHealth: "Sopotetab Kolimwek",
    satelliteData: "Ng'aleek ab Satelait",
    soilSensors: "Karatit nebo Ng'wony",
    marketPrices: "Mwaetab Soko",
    saccoFinance: "Robiinik ab SACCO",
    farmAssistant: "Kiptayat nebo mbaret",
    alertsCenter: "Kanyaitosietab Mbaret",
    activityLog: "Buku nebo Boisyet",
    settings: "Katorosietab Mbaret",
    listen: "Kasit (Kelyan)",
    stopListening: "Kagikany Kasit",
    diagnosePhoto: "Nam Picha nebo Soyat",
    highRiskAlert: "Kanyaitosiet Kandoi",
    weatherSummary: "Koret ak Robta",
    viewDetails: "Keer Ng'aleek",
    takeAction: "Yaat Boisyet Nguni",
    applyForLoan: "Soomet Robiinik ab SACCO",
    compareMarkets: "Kerkeryatab Sokoik",
  },
};

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string; nativeLabel: string; flag: string }> = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇰🇪" },
  { code: "sw", label: "Swahili", nativeLabel: "Kiswahili", flag: "🇰🇪" },
  { code: "kik", label: "Kikuyu", nativeLabel: "Gĩkũyũ", flag: "🌿" },
  { code: "luo", label: "Luo", nativeLabel: "Dholuo", flag: "🌾" },
  { code: "kal", label: "Kalenjin", nativeLabel: "Kalenjin", flag: "🌽" },
];
