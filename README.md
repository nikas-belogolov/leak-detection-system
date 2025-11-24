# Water Leak Detection System 💧🌿

A smart IoT solution designed to detect water leaks in garden irrigation systems using machine learning. This project integrates embedded hardware, real-time data streaming, and a modern web dashboard to prevent water waste and protect plants.

## 🚀 Project Overview

This system monitors water flow and soil moisture data from ESP32-based sensors. It uses a custom neural network (`LeakNet`), based on the paper ["Inherently Interpretable Time Series Classification via Multiple Instance Learning"](https://arxiv.org/abs/2311.10049), to analyze time-series data and detect anomalies indicative of leaks. Users can monitor their garden's status and receive alerts through email.

## 🏗️ System Architecture

The project follows a microservices architecture:

1.  **Edge Devices (ESP32)**: Collects sensor data and transmits it via MQTT/HTTP. Supports BLE provisioning.
2.  **Data Ingestion Service**: A Node.js service that consumes raw sensor data, validates it using Protobuf, and queues it in RabbitMQ.
3.  **LeakNet (ML Engine)**: A Python-based service that processes data streams, runs inference using a PyTorch model, and flags potential leaks.
4.  **Web Dashboard**: A user-friendly interface for real-time monitoring, historical data visualization, and system management.

## 🛠️ Technology Stack

### Frontend (Web Dashboard)
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **UI Library**: [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Visualization**: React-Chartjs-2
-   **State/Comms**: Socket.io for real-time updates

### Backend Services
-   **Runtime**: Node.js
-   **Messaging**: RabbitMQ
-   **Serialization**: Protocol Buffers (Protobuf)
-   **Database**: MongoDB (via Mongoose)

### Machine Learning (LeakNet)
-   **Framework**: PyTorch & Lightning
-   **Data Processing**: Pandas, NumPy, Scikit-learn
-   **Optimization**: Optuna
-   **Time Series**: TSAug (Time Series Augmentation)

### Firmware
-   **Platform**: ESP32
-   **SDK**: ESP-IDF
-   **Features**: BLE Provisioning, WiFi connectivity

## 📂 Project Structure

```bash
leak-detection-system/
├── esp32/                  # Firmware code for ESP32 microcontrollers
├── leaknet/                # Python ML project (Training, Inference, Notebooks)
└── web/                    # Monorepo for Web & Node.js services
    ├── apps/
    │   ├── website/                # Next.js Dashboard
    │   ├── data-ingestion-service/ # Node.js Data Receiver
    │   ├── inference-service/      # Service bridging ML & Backend
    │   └── notification-service/   # Alerting system
    └── packages/           # Shared libraries (DB, UI, Config)
```

## 🔗 Related Repositories

-   **Firmware (ESP32)**: [leak-detection-system-esp32](https://github.com/nikas-belogolov/leak-detection-system-esp32)
-   **Machine Learning (LeakNet)**: [leaknet](https://github.com/nikas-belogolov/leaknet)

## 🚦 Getting Started

### Prerequisites
-   Docker & Docker Compose

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nikas-belogolov/leak-detection-system.git
    cd leak-detection-system/web
    ```

2.  **Build and run the entire stack:**
    ```bash
    docker-compose build
    docker-compose up -d
    ```

The system will be available at `http://localhost:3000`

## 👨‍💻 Author

**Nikas Belogolov**

---
*This project is part of my portfolio demonstrating full-stack IoT development capabilities.*
