// Generates lib/geo/gulf.json — real coastlines for the Gulf map.
// GCC states come from Natural Earth 50m (accurate coasts, Qatar/Bahrain intact);
// neighbours from 110m to keep the bundle small. Coordinates rounded to 3 dp.
// Run: node scripts/generate-gulf-geo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as topojson from "topojson-client";
const require = createRequire(import.meta.url);
const load = (f) => { const t = JSON.parse(readFileSync(require.resolve(`world-atlas/${f}`), "utf8")); return topojson.feature(t, t.objects.countries).features; };
const GCC = ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman"];
const NEIGH = ["Yemen", "Iraq", "Iran", "Jordan", "Egypt", "Sudan", "Eritrea", "Somalia", "Djibouti", "Ethiopia", "Syria", "Israel", "Lebanon", "Pakistan", "Afghanistan", "Turkmenistan", "India", "Turkey", "Libya", "South Sudan", "Somaliland", "Palestine"];
const round = (c) => Array.isArray(c[0]) ? c.map(round) : [+c[0].toFixed(3), +c[1].toFixed(3)];
const pick = (feats, names, gcc) => feats.filter((f) => names.includes(f.properties.name)).map((f) => ({
  type: "Feature", properties: { name: f.properties.name, gcc }, geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
}));
const features = [...pick(load("countries-110m.json"), NEIGH, 0), ...pick(load("countries-50m.json"), GCC, 1)];
writeFileSync("lib/geo/gulf.json", JSON.stringify({ type: "FeatureCollection", features }));
console.log("features:", features.map((f) => f.properties.name).join(", "));

