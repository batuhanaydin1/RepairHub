
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/ backend/
RUN dotnet restore backend/RepairHub.API/RepairHub.API.csproj
RUN dotnet publish backend/RepairHub.API/RepairHub.API.csproj -c Release --no-restore -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "RepairHub.API.dll"]
