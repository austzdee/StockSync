# \# StockSync

# 

# !\[CI](https://github.com/austzdee/StockSync/actions/workflows/dotnet.yml/badge.svg)

# 

# StockSync is a modern inventory and warehouse stock management API built with ASP.NET Core and Entity Framework Core.

# 

# It demonstrates production-focused backend engineering practices including authentication, authorization, stock transfers, audit logging, automated testing, and CI/CD pipelines.

# 

# \---

# 

# \## Features

# 

# \- JWT Authentication

# \- Refresh Token Rotation

# \- Logout / Token Revocation

# \- Role-Based Authorization (Admin/User)

# \- Product Management

# \- Warehouse Management

# \- Stock Assignment

# \- Stock Transfers Between Warehouses

# \- Audit Logging

# \- Soft Delete Support

# \- Pagination \& Filtering

# \- Integration Testing

# \- GitHub Actions CI Pipeline

# 

# \---

\## Screenshots



\### Swagger API



!\[Swagger](assets/swagger-home.png)



\### Authentication



!\[Auth Login](assets/auth-login.png)



\### Stock Transfer



!\[Transfer](assets/stock-transfer.png)



\### CI Pipeline



!\[GitHub Actions](assets/github-actions-pass.png)

# \---

# \## Tech Stack

# 

# \- ASP.NET Core (.NET 10)

# \- Entity Framework Core

# \- SQL Server / LocalDB

# \- JWT Bearer Authentication

# \- xUnit Integration Testing

# \- GitHub Actions

# 

# \---

# 

# \## Example API Endpoints

# 

# \### Auth

# 

# \- `POST /api/Auth/register`

# \- `POST /api/Auth/login`

# \- `POST /api/Auth/refresh`

# \- `POST /api/Auth/logout`

# 

# \### Products

# 

# \- `GET /api/Products`

# \- `POST /api/Products` \*(Admin only)\*

# \- `PUT /api/Products/{id}`

# \- `DELETE /api/Products/{id}`

# 

# \### Stock

# 

# \- `POST /api/stock/assign`

# \- `POST /api/stock/transfer`

# 

# \---

# 

# \## Quality Checks

# 

# Automated GitHub Actions workflow runs on every push:

# 

# \- Restore packages

# \- Build solution

# \- Apply database migrations

# \- Run integration tests

# 

# \---

# 

# \## Local Setup

# 

# ```bash

# git clone https://github.com/austzdee/StockSync.git

# cd StockSync

# dotnet restore

# dotnet ef database update

# dotnet run

