FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-server

WORKDIR /source

COPY ./OpenTriviaNight.Api/OpenTriviaNight.Api.csproj OpenTriviaNight.Api/OpenTriviaNight.Api.csproj
RUN dotnet restore OpenTriviaNight.Api/OpenTriviaNight.Api.csproj

COPY ./OpenTriviaNight.Api OpenTriviaNight.Api
RUN dotnet publish OpenTriviaNight.Api/OpenTriviaNight.Api.csproj -c Release -o publish

FROM node:20 AS build-ui

WORKDIR /source

COPY ./ui/package.json package.json
COPY ./ui/package-lock.json package-lock.json
RUN npm install
COPY ui .
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
COPY --from=build-server /source/publish .
COPY --from=build-ui /source/dist wwwroot

ENTRYPOINT ["dotnet", "OpenTriviaNight.Api.dll"]