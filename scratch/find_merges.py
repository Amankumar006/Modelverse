import os
import json
from collections import defaultdict

DATA_DIR = "data/models"
files = [f for f in os.listdir(DATA_DIR) if f.endswith(".json") and f != "_index.json"]

models = []
for f in files:
    with open(os.path.join(DATA_DIR, f)) as file:
        models.append(json.load(file))

groups = defaultdict(list)
for m in models:
    if m.get("developer") == "OpenAI" and m.get("family"):
        # Make a key based on family, primaryTask, and modality
        key = (m.get("family"), m.get("primaryTask"), tuple(sorted(m.get("modality", []))))
        groups[key].append(m)

for key, members in groups.items():
    if len(members) > 1:
        print(f"Group: {key}")
        for m in members:
            print(f"  - {m['id']} ({m['name']})")
