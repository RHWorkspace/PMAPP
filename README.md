<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# Project Management App

A modern project management web application built with **Laravel** (backend API) and **React** (frontend, via Inertia.js).  
This app helps teams manage projects, tasks, users, workloads, and more.

---

## Features

- User, Team, Division, and Project management
- Task management with subtasks, priorities, and status
- Application & Module management
- Sprint and backlog management
- Workload & resource summary dashboard
- Filtering, searching, and pagination for all major data tables
- Role-based access (Admin, Member, Viewer)
- Responsive, modern UI (Tailwind CSS)
- SweetAlert2 for confirmation and notifications

---

## Tech Stack

- **Backend:** Laravel 10+, Eloquent ORM, REST API, Inertia.js
- **Frontend:** React, Inertia.js, Tailwind CSS
- **Database:** MySQL/MariaDB (default), supports others via Laravel
- **Other:** SweetAlert2, React Icons

---

## Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/project-management.git
    cd project-management
    ```

2. **Install PHP dependencies**
    ```bash
    composer install
    ```

3. **Install JS dependencies**
    ```bash
    npm install
    ```

4. **Copy and edit environment file**
    ```bash
    cp .env.example .env
    # Edit .env for your DB and mail settings
    ```

5. **Generate app key**
    ```bash
    php artisan key:generate
    ```

6. **Run migrations and seeders**
    ```bash
    php artisan migrate --seed
    ```

7. **Build frontend assets**
    ```bash
    npm run dev
    # or for production
    npm run build
    ```

8. **Start the development server**
    ```bash
    php artisan serve
    ```

---

## Usage

- Access the app at [http://localhost:8000](http://localhost:8000)
- Login with the seeded admin account or register a new user.
- Manage teams, users, projects, tasks, and monitor workloads.

---

## Screenshots

> _Add screenshots of dashboard, task list, workload summary, etc. here for better documentation._

---

## Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## Credits

- Laravel by [Taylor Otwell](https://github.com/taylorotwell)
- Inertia.js, React, Tailwind CSS, SweetAlert2, and all open-source contributors
