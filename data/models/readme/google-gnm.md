# GNM: Open Ecosystem of Parametric Human Models & Perception Stacks

GNM (Google Navigation & Perception Model) is Google Research's open ecosystem for 3D parametric human modeling and perception, starting with **GNM Head**.

---

## 🛠️ Overview & Components

- **GNM Head**: A parametric 3D head representation capturing fine-grained facial geometry, expressions, and identity details.
- **Perception Stack**: Open PyTorch pipelines for real-time 3D landmark tracking, mesh reconstruction, and head pose estimation.

---

## 🚀 Installation & Usage

```bash
git clone https://github.com/google/GNM.git
cd GNM
pip install -r requirements.txt
```

```python
import torch
from gnm import GNMHeadModel

# Initialize 3D parametric head model
model = GNMHeadModel.from_pretrained("google/gnm-head-v1")

# Predict 3D mesh coordinates from RGB image
image_tensor = load_image("portrait.png")
mesh_3d = model(image_tensor)
print("Mesh Vertices Shape:", mesh_3d.vertices.shape)
```
