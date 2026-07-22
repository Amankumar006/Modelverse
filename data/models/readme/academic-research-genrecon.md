# GenRecon: Bridging Generative Priors for Multi-View 3D Scene Reconstruction

**GenRecon** is an advanced 3D computer vision and generative modeling framework developed by researchers at the **Technical University of Munich (TUM)** (*Katharina Schmid, Nicolas von Lützow, Jozef Hladký, Angela Dai, and Matthias Nießner*). It addresses a fundamental challenge in 3D scene reconstruction: traditional multi-view reconstruction methods are strictly deterministic and suffer when dealing with sparse camera views, specular surfaces, or unobserved areas behind objects.

GenRecon reformulates multi-view 3D scene reconstruction as a **conditional 3D generation task** over spatially-localized, overlapping chunks tiling an indoor environment. By incorporating state-of-the-art object-level generative 3D priors (such as **Trellis.2**), GenRecon is able to hallucinate complete, realistic geometry and material textures for unobserved regions while maintaining strict alignment with input multi-view RGB images.

---

## 🔬 Key Capabilities & Methodological Innovations

- **Conditional 3D Generation over Spatial Chunks:** Partitions large indoor scenes into overlapping 3D spatial chunks, enabling seamless scaling to large-extent indoor environments.
- **Integration of Trellis.2 Generative Prior:** Leverages strong 3D diffusion and flow matching priors (from Trellis.2) to predict structure latents (SLAT) and dense 3D meshes.
- **Projection-Based Conditioning Mechanism:** Lifts 2D multi-view image features extracted via vision backbones into a 3D feature representation aligned with the scene.
- **Editable PBR-Ready Mesh Generation:** Directly outputs PBR-ready (Physically Based Rendering) meshes complete with geometry, surface normals, and texture maps (`.glb`).

```
Sparse Multi-View RGB Images ──► 2D Feature Extraction ──► Projection-Based 3D Lifting ──► Trellis.2 Generative Chunk Diffusion ──► Editable PBR Mesh (.glb)
```

---

## 📊 Performance & Benchmarks

- **Visual Quality Improvement:** Outperforms contemporary 3D scene reconstruction baselines by **16%** in visual quality and completeness metrics on benchmark indoor scene datasets (SAGE / ScanNet).
- **Occlusion Handling:** Excels at hallucinating back-sides of furniture and occluded scene structures where traditional photogrammetry yields large voids or noisy geometry.

---

## 🚀 Quickstart & Usage

```bash
git clone -b main https://github.com/kasothaphie/GenRecon.git --recursive
cd GenRecon
. ./setup.sh --new-env --basic --flash-attn --nvdiffrast --nvdiffrec --cumesh --o-voxel --flexgemm
```

```bash
python reconstruct_scene.py \
  --input_dir data/sample_scene \
  --checkpoint_path checkpoints/genrecon_512.pt \
  --output_glb results/scene.glb
```

---

## 🔗 Official Links & Resources

- [Official Project Page](https://kasothaphie.github.io/GenRecon/)
- [arXiv Paper (arXiv:2605.23888)](https://arxiv.org/abs/2605.23888)
- [Paper PDF Download](https://arxiv.org/pdf/2605.23888.pdf)
- [GitHub Code Repository](https://github.com/kasothaphie/GenRecon)
- [Hugging Face Paper Page](https://huggingface.co/papers/2605.23888)
