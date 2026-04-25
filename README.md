# \# StockSync

# 

# StockSync is a backend warehouse inventory management API built with ASP.NET Core and Entity Framework Core. It manages products, warehouses, stock levels, reservations, and transfers across multiple locations with audit logging and automated tests.

# 

# \---

# 

# \## Overview

# 

# This project was designed to simulate real-world inventory workflows used in retail, logistics, eCommerce, and warehouse operations.

# 

# StockSync focuses on:

# 

# \- Accurate stock control

# \- Multi-warehouse inventory tracking

# \- Reservation workflows (cart/order holding)

# \- Atomic stock transfers

# \- Low stock monitoring

# \- Search, filtering, and pagination

# \- Audit history for stock movements

# 

# \---

# 

# \## Features

# 

# \### Product Management

# 

# \- Create products

# \- Update products

# \- Soft delete products

# \- SKU uniqueness validation

# 

# \### Warehouse Management

# 

# \- Create warehouses

# \- Update warehouses

# \- Soft delete warehouses

# 

# \### Inventory Operations

# 

# \- Assign stock to a warehouse

# \- Reserve stock

# \- Release reserved stock

# \- Transfer stock between warehouses

# 

# \### Reporting

# 

# \- Low stock alerts (`total quantity < 10`)

# \- Category filtering

# \- Pagination support

# 

# \### Reliability

# 

# \- SQL transactions for transfers

# \- Validation rules

# \- Conflict handling

# \- Audit logs

# 

# \### Testing

# 

# \- xUnit integration tests

# 

# \---

# 

# \## Tech Stack

# 

# \- ASP.NET Core Web API

# \- C#

# \- Entity Framework Core

# \- SQL Server / LocalDB

# \- Swagger / OpenAPI

# \- xUnit

# 

# \---

# 

# \## API Examples

# 

# \### Get paginated stock

# 

# ```http

# GET /api/Stock?limit=10\&offset=0

