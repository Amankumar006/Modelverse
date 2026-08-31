import { getModelFamily } from './src/lib/lineage';

const names = [
  "DeepSeek-R1", "DeepSeek-V3.1", "Mistral Large 2", "Mistral Small 3.1 24B", "Llama 3.3 70B", "o3-mini", "DeepSeek V3 0324"
];

for (const n of names) {
  console.log(n, "=>", getModelFamily(n));
}
