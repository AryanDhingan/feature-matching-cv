# Feature Matching Between Two Images

A Computer Vision mini-project that detects and matches common visual features between two images using **ORB** and **SIFT** feature detection algorithms with **Brute-Force (BF) Matching**.

The project includes both an academic **Jupyter/Google Colab notebook** for experimentation and analysis, and a simple **web-based interface** built with HTML, CSS, JavaScript, and Flask for interactive image matching.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Methodology](#methodology)
- [Image Pairs](#image-pairs)
- [Experimental Results](#experimental-results)
- [Observations](#observations)
- [Web Application](#web-application)
- [Running the Web Application](#running-the-web-application)
- [Running the Notebook](#running-the-notebook)
- [Key Concepts Demonstrated](#key-concepts-demonstrated)
- [Conclusion](#conclusion)
- [Project Files](#project-files)
- [Authors](#authors)
- [Academic Details](#academic-details)

---

## Project Overview

Feature matching is an important technique in Computer Vision used to identify corresponding points between two images.

In this project, two feature detection and description methods are explored:

- **ORB** (Oriented FAST and Rotated BRIEF)
- **SIFT** (Scale-Invariant Feature Transform)

The extracted descriptors are matched using OpenCV's **Brute-Force Matcher**.

The project evaluates both methods under different image conditions, including:

- Rotation and viewpoint changes
- Cropping and scale changes
- Lighting and brightness changes

---

## Objectives

1. Detect important visual keypoints in images.
2. Generate feature descriptors using ORB and SIFT.
3. Match descriptors between two images using BFMatcher.
4. Visualize matched feature points.
5. Compare ORB and SIFT based on:
   - Number of detected/matched features
   - Processing time
   - Performance under different image conditions
6. Provide a simple interactive web interface for image matching.

---

## Technologies Used

### Computer Vision

- Python
- OpenCV
- NumPy
- Matplotlib
- Pandas

### Algorithms

- ORB
- SIFT
- Brute-Force Matcher
- Hamming Distance
- L2 / Euclidean Distance
- Lowe's Ratio Test

### Web Application

- HTML5
- CSS3
- JavaScript
- Flask
- Flask-CORS

### Development Tools

- Google Colab / Jupyter Notebook
- Visual Studio Code
- Git
- GitHub

---

## Project Structure

```text
Feature-Matching-Project/
│
├── notebook/
│   └── Feature_Matching.ipynb
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

---

## Methodology

### 1. ORB

ORB is a fast feature detection and description algorithm that combines:

- FAST keypoint detection
- BRIEF descriptor
- Orientation information

Pipeline:

```text
ORB → Binary Descriptors → BFMatcher → Hamming Distance
```

The BFMatcher is configured with:

```python
cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
```

The top matches are sorted according to descriptor distance and visualized.

### 2. SIFT

SIFT detects and describes image features that are more robust to changes such as scale and rotation.

Pipeline:

```text
SIFT → Floating-Point Descriptors → BFMatcher → L2 Distance
```

The matcher is configured using:

```python
cv2.BFMatcher(cv2.NORM_L2)
```

The project uses **K-Nearest Neighbour matching (k=2)** followed by **Lowe's Ratio Test**. A ratio threshold of `0.75` is used to filter ambiguous matches.

A match is accepted when:

```text
best_match_distance < 0.75 × second_best_match_distance
```

---

## Image Pairs

Three image pairs are used for comparison. The same ORB and SIFT pipelines are applied to all of them.

| Image Pair | Test Condition                    |
| ---------- | --------------------------------- |
| Pair 1     | Rotation + viewpoint change       |
| Pair 2     | Rotation + cropping/scale change  |
| Pair 3     | Lighting/brightness change        |

---

## Experimental Results

| Image Pair | ORB Matches | ORB Time (s) | SIFT Good Matches | SIFT Time (s) |
| ---------- | ----------: | -----------: | ----------------: | ------------: |
| Pair 1     | 274         | ~0.074       | 279               | ~0.720        |
| Pair 2     | 502         | ~0.077       | 1493              | ~1.120        |
| Pair 3     | 439         | ~0.072       | 520               | ~0.768        |
| **Average**| **405**     | **~0.074**   | **764**           | **~0.870**    |

> **Note:** Processing times can vary depending on the execution environment and system load.

---

## Observations

- ORB provides significantly faster feature matching.
- SIFT produced more matches passing the ratio-test criterion for the image pairs tested.
- ORB uses binary descriptors and Hamming distance.
- SIFT uses floating-point descriptors and L2 distance.
- The matching strategies are different, so raw match counts should not be interpreted as a direct measure of overall algorithm superiority.
- SIFT generally required more processing time than ORB in these experiments.

---

## Web Application

The project also includes a simple web interface that allows users to:

- Upload two images
- Select a matching algorithm
- Run feature matching
- View the detected/matched features
- View keypoint and match statistics
- Compare ORB and SIFT results

### Available Modes

- **ORB**
- **SIFT**
- **Both**

The frontend communicates with a Flask backend through an HTTP API.

---

## Running the Web Application

### Step 1 — Clone the Repository

```bash
git clone https://github.com/AryanDhingan/feature-matching-cv.git
cd feature-matching-cv
```

### Step 2 — Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3 — Start the Flask Backend

```bash
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

### Step 4 — Open the Frontend

Open the `frontend` folder and launch `index.html`. You can also use the **Live Server** extension in Visual Studio Code.

> **Important:** Make sure the Flask backend is running before using the **Match Features** button.

---

## Running the Notebook

The academic implementation and experimental analysis are available in:

```text
notebook/Feature_Matching.ipynb
```

The notebook contains:

- Environment setup
- Image loading
- Image visualization
- ORB keypoint detection
- ORB descriptor matching
- SIFT keypoint detection
- SIFT descriptor matching
- Lowe's ratio test
- Match visualization
- ORB vs SIFT comparison
- Performance analysis
- Final observations and conclusion

It can be opened using Google Colab, Jupyter Notebook, JupyterLab, or VS Code.

---

## Key Concepts Demonstrated

- Feature Detection
- Feature Description
- Keypoints
- Binary Descriptors
- Floating-Point Descriptors
- Brute-Force Matching
- Hamming Distance
- L2 Distance
- KNN Matching
- Lowe's Ratio Test
- Feature Match Visualization
- Algorithm Performance Comparison

---

## Conclusion

This project demonstrates how ORB and SIFT can be used to identify corresponding visual features between two images.

The experiments show a practical trade-off between speed and matching behaviour. ORB provides faster processing, while SIFT produced more ratio-test-passing matches for the image pairs used in this project.

The results also demonstrate that feature-matching performance depends on the characteristics of the images, such as rotation, viewpoint, scale, cropping, and lighting. Therefore, the choice of feature-matching technique depends on the requirements of the particular Computer Vision application.

---

## Project Files

| File / Folder | Description                              |
| ------------- | ---------------------------------------- |
| `notebook/`   | Jupyter/Colab implementation and experiments |
| `frontend/`   | Web interface                            |
| `backend/`    | Flask API and OpenCV processing          |
| `README.md`   | Project documentation                    |

---

## Authors

- **Aryan Dhingan** — Roll No.: 24315F0006
- **Amey Dalvi** — Roll No.: 24315A0062

**GitHub Repository:** [Feature Matching Between Two Images](https://github.com/AryanDhingan/feature-matching-cv)

---

## Academic Details

- **Course:** Computer Vision
- **Project Type:** Mini Project
- **Institution:** Vidyalankar School of Information Technology (VSIT), Mumbai