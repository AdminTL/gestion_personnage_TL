FROM python:3.7-alpine AS build
WORKDIR /app
RUN apk add --update nodejs nodejs-npm
COPY . .
WORKDIR /app/src/client_web/
RUN npm install
RUN npm run build

FROM python:3.7-alpine AS final
WORKDIR /app/src/server_web/
COPY --from=build /app/src/server_web .
RUN pip install tornado sockjs-tornado tinydb oauth2client gspread pynpm
CMD ["python", "__main__.py"]