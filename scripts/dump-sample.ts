import { writeFileSync } from "node:fs";
import { sampleData } from "../lib/pdf/sampleData";

writeFileSync("scripts/sample-data.json", JSON.stringify(sampleData, null, 2));
console.log("wrote scripts/sample-data.json");
