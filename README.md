# 🚗 VehicleManagementSystem

A comprehensive Vehicle Management System developed as part of the **IT2150 – IT Project Assignment** at the **Sri Lanka Institute of Information Technology (SLIIT)**.

![Project](https://img.shields.io/badge/Project-ITP__IT__137-blue?style=for-the-badge)
![Campus](https://img.shields.io/badge/Campus-Malabe-green?style=for-the-badge)
![Mode](https://img.shields.io/badge/Mode-Weekend-orange?style=for-the-badge)
![Year](https://img.shields.io/badge/Year-2026-red?style=for-the-badge)

---

## 📋 Project Information

| Field | Details |
|-------|---------|
| 🔖 Project ID | **ITP_IT_137** |
| 🏫 Campus | Malabe |
| 📅 Mode | WE (Weekend) |
| 👥 Group | Y2.S2.WE.IT.02.02 |
| 🗓️ Year / Semester | Year 2 – Semester 2, 2026 |

---

## 👥 Group Members

| No. | Registration Number | Student Name |
|-----|---------------------|--------------|
| 01 | IT24104151 | De Silva R.Y.K. |
| 02 | IT24103016 | Perera R.H.H. |
| 03 | IT24104008 | Bandara I.M.S.A. |
| 04 | IT24103295 | Dilrukshi D.M.H. |
| 05 | IT24103164 | Jayathilake N.A.B.S. |

---

## 🧩 System Modules

The VehicleManagementSystem is divided into the following core modules, each managed by a dedicated team member:

### 1. 👤 User Management
> **Responsible:** IT24103016 – Perera R.H.H.

Handles registration, login, and role-based access control for all system users including admins, staff, and customers.

### 2. 📅 Bookings
> **Responsible:** IT24103295 – Dilrukshi D.M.H.

Manages vehicle booking requests, scheduling, availability checks, and booking status tracking.

### 3. 🧑‍💼 Customer
> **Responsible:** IT24104151 – De Silva R.Y.K.

Manages customer profiles, contact information, and customer-related data within the system.

### 4. 🚙 Vehicle
> **Responsible:** IT24103016 – Perera R.H.H.

Handles vehicle registration, details, availability status, and fleet management.

### 5. 🔧 Service
> **Responsible:** IT24104008 – Bandara I.M.S.A.

Tracks vehicle service history, maintenance schedules, and service records.

### 6. 🧾 Invoice
> **Responsible:** IT24103164 – Jayathilake N.A.B.S.

Generates and manages invoices for bookings and services rendered to customers.

### 7. 💬 Feedback
> **Responsible:** IT24104151 – De Silva R.Y.K.

Collects and manages customer feedback and reviews for continuous service improvement.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| 💻 Frontend | React|
| ⚙️ Backend | Java |
| 🗄️ Database | Postgres |
| 🧰 IDE | IntelliJ IDEA / NetBeans / Vscode |

---

## 🚀 Getting Started

### Prerequisites
- ☕ Java JDK 25
- 🗄️ Postgres
- 🧰 IntelliJ IDEA / NetBeans IDE

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/VehicleManagementSystem.git
cd VehicleManagementSystem
```

**2. Set up the database**
```bash
postgres -u root -p < database/schema.sql
```

**3. Configure the connection**
- Open the project in your IDE
- Update database credentials in the config file

**4. Build and Run**
- Build the project
- Run `Main.java` to launch the application

---

## 📁 Project Structure

```
VehicleManagementSystem/
├── src/
│   ├── UserManagement/
│   ├── Bookings/
│   ├── Customer/
│   ├── Vehicle/
│   ├── Service/
│   ├── Invoice/
│   └── Feedback/
├── database/
│   └── schema.sql
└── README.md
```

---

## 📄 License

This project was developed for **academic purposes** at **SLIIT** as part of the IT2150 – IT Project module.

---

*🏫 Sri Lanka Institute of Information Technology | IT2150 IT Project | 2026*
