# 🛡️ Campus Safety — AI-Based Intelligent Surveillance Platform

An AI-powered video surveillance and campus safety platform designed to improve security through **real-time video analytics, threat detection, restricted-zone monitoring, and security event tracking**.

The project is built around the idea of using **existing CCTV infrastructure** rather than requiring additional hardware. It combines a modern web dashboard with an offline computer-vision analytics engine.

---

## 🚀 Features

### 🎥 Real-Time Video Surveillance

* Supports webcam-based video input.
* Supports recorded video files.
* Designed to support CCTV/RTSP streams.
* Live MJPEG video feed displayed directly on the web dashboard.

### 🤖 AI-Based Object Detection

Uses **YOLOv4-tiny** with OpenCV DNN for lightweight CPU-based detection.

Detects:

* 👤 Persons
* 🚗 Cars
* 🚌 Buses
* 🚚 Trucks
* 🏍️ Motorbikes
* 🚲 Bicycles
* 🚤 Other supported vehicle classes

### 🎯 Object Tracking

A centroid-based tracking system assigns persistent IDs to detected objects.

Example:

```text
person #1
person #2
car #3
```

This allows the system to monitor how long an individual object remains within a restricted area.

### 🚨 Restricted-Zone / Virtual Fence

Security personnel can define a restricted area directly on the live video feed by clicking points on the screen.

The system detects when tracked objects enter the restricted zone and generates an intrusion event.

### ⏱️ Loitering Detection

The system monitors how long an object remains inside a restricted area.

If an object stays beyond the configured threshold, a **LOITERING** event is generated.

### 🏃 Suspicious Activity Detection

Rapid movement by detected persons can trigger a suspicious-activity event.

The system estimates movement speed using the object's tracking history.

### 🌙 Night-Time Detection

The system continuously measures scene luminance.

When low-light conditions are detected, **CLAHE-based image enhancement** is applied to improve visibility and assist detection.

### 👤 Face Detection

Faces are detected inside detected person regions using OpenCV Haar Cascade classifiers.

### 🚘 Number Plate Detection

The system can localise vehicle number plates using OpenCV's plate detection cascade.

> **Note:** The current implementation performs plate localisation but does not perform OCR-based number-plate character recognition.

### 📊 Live Analytics Dashboard

The dashboard displays:

* Persons detected
* Vehicles detected
* Faces detected
* Plates detected
* Objects inside restricted zone
* Currently tracked objects
* FPS
* Alert status
* Security events
* Detection confidence
* Loitering threshold
* Night-mode status

---

## 🏗️ System Architecture

```text
                ┌─────────────────────┐
                │   CCTV / Webcam     │
                │   / Video File      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Analytics Server   │
                │      Python         │
                │       Flask         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   YOLOv4-Tiny       │
                │ Object Detection    │
                └──────────┬──────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Tracking      Zone Detection   Secondary
                                     Analytics
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                ┌─────────────────────┐
                │   Flask REST API    │
                │ /status /start      │
                │ /stop /zone /config │
                │ /video_feed         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Web Dashboard     │
                │   React + Vite      │
                └─────────────────────┘
```

---

## 🧰 Tech Stack

### Frontend

* React
* Vite
* JavaScript / JSX
* CSS
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

### AI / Computer Vision

* Python
* OpenCV
* OpenCV DNN
* YOLOv4-tiny
* NumPy
* Flask
* Flask-CORS
* Haar Cascade Classifiers

### Development Tools

* Git
* GitHub
* VS Code
* MongoDB Compass

---

## 📁 Project Structure

```text
campus_safety/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── server.js
│   ├── surveillance_server.py
│   ├── border_detector.py
│   ├── models/
│   │   └── User.js
│   ├── yolov4-tiny.cfg
│   ├── yolov4-tiny.weights
│   ├── coco.names
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd campus_safety
```

---

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 3. Node.js Backend Setup

Open another terminal:

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend:

```bash
node server.js
```

The API server runs on:

```text
http://localhost:5000
```

---

## 4. Python Analytics Server

The AI surveillance engine runs separately from the Node.js backend.

Create and activate a virtual environment:

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run:

```bash
python surveillance_server.py
```

The analytics server exposes:

```text
http://localhost:5000/video_feed
http://localhost:5000/status
http://localhost:5000/start
http://localhost:5000/stop
http://localhost:5000/zone
http://localhost:5000/config
http://localhost:5000/health
```

> **Important:** If the Node.js backend and Python surveillance server are running simultaneously, they must use **different ports**.

For example:

```text
Node.js Backend       → http://localhost:5000
Python Analytics      → http://localhost:5001
```

The frontend API/analytics URLs should then be configured accordingly.

---

# 🧠 AI Pipeline

The surveillance engine follows this pipeline:

```text
Video Frame
     ↓
Low-Light Assessment
     ↓
Night Enhancement (if required)
     ↓
YOLOv4-tiny Detection
     ↓
Non-Maximum Suppression
     ↓
Centroid Tracking
     ↓
Virtual Fence Detection
     ↓
Loitering Detection
     ↓
Suspicious Movement Detection
     ↓
Face Detection
     ↓
Number Plate Localisation
     ↓
Annotated Frame
     ↓
Web Dashboard
```

---

# 🔐 Authentication

The platform includes a Node.js authentication backend supporting:

* User registration
* User login
* Password hashing using bcrypt
* JWT-based authentication
* User roles
* MongoDB-based user storage

---

# 📡 API Endpoints

## Node.js Backend

### Register

```http
POST /api/auth/register
```

Example:

```json
{
  "name": "Krishna",
  "email": "example@gmail.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
```

---

## Surveillance Server

### Health Check

```http
GET /health
```

### Start Analytics

```http
POST /start
```

Example:

```json
{
  "source": 0
}
```

### Stop Analytics

```http
POST /stop
```

### Get Analytics Status

```http
GET /status
```

### Video Stream

```http
GET /video_feed
```

### Define Restricted Zone

```http
POST /zone
```

Example:

```json
{
  "points": [
    [0.55, 0.05],
    [0.97, 0.05],
    [0.97, 0.95],
    [0.55, 0.95]
  ]
}
```

### Configure Detection

```http
POST /config
```

Example:

```json
{
  "confidence": 0.35,
  "loiter": 5
}
```

---

# 🎯 Use Cases

The platform can be adapted for:

* 🏫 Campus security
* 🛣️ Border surveillance
* 🏢 Industrial security
* 🏭 Restricted industrial areas
* 🚧 Construction sites
* 🏛️ Government facilities
* 🚉 Transportation hubs
* 🔒 High-security zones

---

# 💡 Design Philosophy

The project follows a **software-first surveillance approach**.

Instead of deploying new physical sensors or cameras, the system is designed to consume video from infrastructure that is already available.

This makes the solution:

* Cost-effective
* Hardware-independent
* Easy to prototype
* Suitable for existing CCTV infrastructure
* Capable of running AI analytics locally

The analytics engine is designed to run **offline on CPU**, reducing dependence on cloud AI services for the actual video-processing pipeline.

---

# 👥 Team

### Team Members

* **Krishna Nandan Jha**
* **Ranganyya Misra**
* **Kritika Grover**
* **Somya Aggarwal**
* **Lavish Singh**
* **Lakshaya Dogra**

This project was developed collaboratively by the team as an AI-based intelligent surveillance and campus safety solution.

---

# 🏆 Project Context

Developed as part of **Smart India Hackathon (SIH) 2026** work around intelligent video analytics and surveillance using existing CCTV infrastructure.

The project focuses on combining:

```text
Computer Vision
       +
AI Analytics
       +
Real-Time Monitoring
       +
Web Technology
       +
Security Events
```

into a single platform.

---

# 📌 Current Limitations

The current prototype has several known limitations:

* YOLOv4-tiny is optimised for lightweight CPU inference rather than maximum detection accuracy.
* Number plates are localised but OCR is not currently implemented.
* Face detection uses Haar Cascades.
* Centroid tracking is designed for relatively simple scenes.
* Real-world CCTV deployment would require testing against different cameras, lighting conditions, camera angles and network conditions.
* The offline analytics engine currently runs locally rather than as a cloud-hosted inference service.

---

# 🔮 Future Improvements

Planned improvements include:

* [ ] YOLOv8/YOLO11-based detection
* [ ] DeepSORT/ByteTrack tracking
* [ ] Number-plate OCR
* [ ] Improved face recognition pipeline
* [ ] Cloud-based analytics deployment
* [ ] RTSP camera management
* [ ] Push notifications for security alerts
* [ ] Email/SMS alerts
* [ ] Historical analytics dashboard
* [ ] Database-backed security event history
* [ ] Multi-camera monitoring
* [ ] Role-based administration
* [ ] Improved low-light enhancement
* [ ] Edge-device deployment

---

# 📜 License

This project is developed for educational, research, and demonstration purposes.

---

## ⭐ Acknowledgements

We would like to thank everyone who contributed to the development, testing, design, and demonstration of this project.

**Team Campus Safety**
Krishna Nandan Jha · Rajaanya Misra · Kritika Grover · Somya Agarwal · Lavish Singh · Lakshaya Dogra
