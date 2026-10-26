
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/RepairHub.API/RepairHub.API.csproj backend/RepairHub.API/
RUN dotnet restore backend/RepairHub.API/RepairHub.API.csproj

COPY backend/ backend/
RUN dotnet publish backend/RepairHub.API/RepairHub.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "RepairHub.API.dll"]
