FROM n8nio/n8n:latest

# 創建持久化存儲目錄
RUN mkdir -p /home/node/.n8n

# 設置工作目錄
WORKDIR /home/node/.n8n

# 設置環境變數
ENV NODE_ENV=production
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV GENERIC_TIMEZONE=Asia/Taipei
ENV N8N_PORT=5678
ENV N8N_RUNNERS_ENABLED=true
ENV DB_TYPE=sqlite
ENV DB_SQLITE_PATH=/home/node/.n8n/database.sqlite

# 設置持久化存儲
VOLUME /home/node/.n8n
