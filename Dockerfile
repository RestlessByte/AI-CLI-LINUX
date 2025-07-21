FROM oven/bun:1


WORKDIR /app

# Копируем bun.lock и package.json для установки зависимостей
COPY bun.lock package.json ./ 

# Устанавливаем зависимости через bun
RUN bun install

# Копируем весь остальной код
COPY . .

# Открываем порт 5000 (как в docker-compose)
EXPOSE 5000

# Команда запуска — адаптируй под свой entrypoint (index.ts)
CMD ["bun", "run", "index.ts"]
