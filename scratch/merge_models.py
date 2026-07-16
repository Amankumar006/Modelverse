import os
import json

DATA_DIR = "data/models"

def merge_models(target_id, source_id):
    target_path = os.path.join(DATA_DIR, f"{target_id}.json")
    source_path = os.path.join(DATA_DIR, f"{source_id}.json")

    if not os.path.exists(target_path):
        print(f"Target {target_path} not found.")
        return
    if not os.path.exists(source_path):
        print(f"Source {source_path} not found.")
        return

    with open(target_path, "r") as f:
        target = json.load(f)
    
    with open(source_path, "r") as f:
        source = json.load(f)

    # Initialize costTiers if not present
    if "costTiers" not in target or not target["costTiers"]:
        target["costTiers"] = []
        # Add the target itself as a tier if we want to be complete?
        # Typically the parent itself is the primary. We'll just add the source.
    
    # Create the tier
    tier = {
        "name": source.get("name", source_id),
        "id": source_id,
        "description": source.get("description", "")
    }
    
    if "pricing" in source and source["pricing"]:
        tier["pricing"] = source["pricing"]
    if "contextWindow" in source and source["contextWindow"] and source["contextWindow"] != "Unknown":
        tier["contextWindow"] = source["contextWindow"]
    
    target["costTiers"].append(tier)
    
    with open(target_path, "w") as f:
        json.dump(target, f, indent=2)
    
    os.unlink(source_path)
    print(f"Merged {source_id} into {target_id} and deleted {source_id}.json")

if __name__ == "__main__":
    merges = [
        ("openai-gpt-4o", "chatgpt-4o"),
        ("openai-dall-e-3", "chatgpt-image"),
        ("davinci-002", "babbage-002"),
        ("openai-computer-using-agent", "computer-use")
    ]
    
    for target, source in merges:
        merge_models(target, source)
