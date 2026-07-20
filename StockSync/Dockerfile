# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy the project file first so dependency restoration can be cached.
COPY StockSync.csproj ./

RUN dotnet restore StockSync.csproj

# Copy the remaining application files.
COPY . .

# Publish the application without restoring packages again.
RUN dotnet publish StockSync.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "StockSync.dll"]
