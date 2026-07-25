# ProxyPose: Video-to-Video 6-DoF Pose Tracking

## Model Overview
**ProxyPose** is a novel 6-DoF (six degrees of freedom) pose tracking system that reframes 3D position and rotation tracking as a video-to-video translation problem. Operating entirely at the pixel level without requiring 3D models or depth sensors, ProxyPose replaces the tracked object in a video with a synthetic proxy polyhedron — a simplified geometric shape — whose position and rotation encode the full 6-DoF pose. This approach handles cases where traditional methods fail, including transparent, reflective, and heavily occluded surfaces.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Video-to-Video Tracking** | Treats 6-DoF pose estimation as a video translation task — no depth sensors needed |
| **Proxy Polyhedron** | Replaces the tracked object with a synthetic shape encoding full 3D pose |
| **Difficult Surfaces** | Handles transparent, reflective, and highly occluded objects effectively |
| **No 3D Model Required** | Does not require a CAD model or 3D scan of the tracked object |
| **Pixel-Level Operation** | Operates entirely in 2D pixel space for hardware-agnostic deployment |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **Paper** | [arXiv:2607.06555](https://arxiv.org/html/2607.06555v1) |
| **GitHub** | [github.com/ruihangzhang97/proxypose](https://github.com/ruihangzhang97/proxypose) |

---

## 📜 License

**Open-Source** — License details available on GitHub.
