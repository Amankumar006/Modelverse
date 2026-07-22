# MAMMA: Markerless Accurate Multi-person Motion Acquisition

## Model Overview
**MAMMA** (**M**arkerless **A**ccurate **M**ulti-person **M**otion **A**cquisition) is a state-of-the-art computer vision model and motion-capture pipeline developed by the **Max Planck Institute for Intelligent Systems (MPI-IS)** in collaboration with **Carnegie Mellon University (CMU)**. Presented as an oral paper at **CVPR 2026**, MAMMA is designed to recover full expressive **SMPL-X** body model parameters directly from synchronized multi-view videos, specifically targeting complex two-person and multi-person physical interactions without requiring motion capture suits or physical markers.

At the core of the pipeline is **MammaNet**, a vision transformer architecture that predicts dense, contact-aware, and visibility-aware surface landmarks to resolve complex correspondences across multiple camera views.

---

## Paper & Code Links
* **Official Website:** [https://mamma.is.tue.mpg.de/](https://mamma.is.tue.mpg.de/)
* **arXiv Abstract:** [https://arxiv.org/abs/2506.13040](https://arxiv.org/abs/2506.13040)
* **Paper PDF:** [https://arxiv.org/pdf/2506.13040](https://arxiv.org/pdf/2506.13040)
* **GitHub Repository:** [https://github.com/cuevhv/mamma](https://github.com/cuevhv/mamma)

---

## Architecture & Technical Methodology

MAMMA decouples the markerless motion capture challenge into two main stages: dense landmark estimation and multi-view 3D SMPL-X fitting.

### 1. MammaNet Dense Landmark Estimator
* **Backbone:** Leverages a ViT-Base (Vision Transformer) backbone to extract deep spatial feature representations from segmentation-masked multi-view image frames.
* **Landmark Decoding:** Predicts 512 individual 2D surface landmarks across the human body mesh.
* **Multi-Head Predictions:**
  * **Pixel Coordinates:** Precise 2D pixel coordinates for each surface landmark.
  * **Uncertainty & Visibility:** Per-landmark confidence scores and visibility flags to downweight occluded body regions.
  * **Contact Probabilities:** Estimates person-to-person contact (e.g., holding hands, dancing, wrestling) and person-to-floor contact to enforce physical ground-truth constraints during optimization.

### 2. Multi-View Epipolar SMPL-X Optimization
* **Symmetric Epipolar Distance:** Matches 2D landmark predictions across views without needing prior person association.
* **SMPL-X Fitting:** Solves for 3D body pose, shape ($\beta$), expression ($\psi$), and camera translations by minimizing landmark re-projection loss weighted by predicted uncertainty and contact probabilities.

---

## Key Features & Capabilities

* **Markerless Operation:** Bypasses expensive hardware mocap suits and optical marker setups; operates on synchronized RGB video (including multi-iPhone setups).
* **Multi-Person & Interaction Handling:** Robust against heavy mutual occlusions and close physical contact between multiple subjects.
* **Dense Surface Mapping:** Predicts 512 surface points rather than standard sparse 2D keypoints (17-25 joints), providing rich geometric guidance for fine-grained body and hand poses.
* **MammaSyn Dataset:** Trained on a synthetic multi-person interaction dataset featuring ground-truth 3D meshes, dense landmarks, and contact state annotations.
* **Flexible Interfaces:** Provides both a command-line interface (`python -m inference run`) and a modern web-based UI (`gui/scripts/dev.sh`).

---

## Performance & Benchmarks

MAMMA was evaluated against traditional optical marker-based systems (Vicon with MoSh++) and existing markerless multi-view baselines:

| Benchmark / Evaluation Metric | Performance | Verification Status |
| :--- | :--- | :--- |
| **Vicon MoSh++ Agreement** | Matches marker-based tracking fidelity in close-interaction sequences | Verified |
| **MammaSyn Surface Accuracy** | Sub-centimeter 3D joint and surface reconstruction error | Verified |
| **Contact Detection Precision** | Accurately identifies foot-floor and person-person contact events | Verified |

---

## Quickstart & Usage

### 1. Installation
```bash
# Clone repository
git clone https://github.com/cuevhv/mamma.git
cd mamma

# Activate environment (conda or micromamba)
micromamba activate mamma

# Verify environment setup and model weights
python -m inference doctor
```

### 2. Running Demo Inference
```bash
# Download bundled example footage
bash data/download_example.sh

# Execute multi-view inference pipeline
python -m inference run \
  --cfg configs/examples/presets/quick.yaml \
  --footage data/mamma_example \
  --seq_name pushing_and_lifting_from_ground \
  --calib configs/examples/calib/iphones_outdoors.yaml \
  --out-tag demo -v
```

### 3. Launch Web Interface
```bash
# Start local development web GUI
bash gui/scripts/dev.sh

# Open http://localhost:3000 in your browser
```

---

## Intended Use & License

* **License:** Custom Non-Commercial Academic/Research License (MPI-IS terms).
* **Target Audience:** Researchers in 3D computer vision, digital human modeling, robotics, sports science, and character animation.
* **Primary Developer:** Max Planck Institute for Intelligent Systems (MPI-IS), Tübingen/Stuttgart, Germany.
