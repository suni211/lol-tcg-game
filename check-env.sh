#!/bin/bash

echo "=== 환경 확인 ==="
echo ""

# Node.js 확인
echo "Node.js 버전:"
which node
node --version 2>/dev/null || echo "node 명령어를 찾을 수 없습니다"
echo ""

# npm 확인
echo "npm 버전:"
which npm
npm --version 2>/dev/null || echo "npm 명령어를 찾을 수 없습니다"
echo ""

# nvm 확인
echo "nvm 확인:"
which nvm
nvm --version 2>/dev/null || echo "nvm 명령어를 찾을 수 없습니다"
echo ""

# PM2 확인
echo "PM2 확인:"
which pm2
pm2 --version 2>/dev/null || echo "pm2 명령어를 찾을 수 없습니다"
echo ""

# MySQL 클라이언트 확인
echo "MySQL 클라이언트 확인:"
which mysql
mysql --version 2>/dev/null || echo "mysql 명령어를 찾을 수 없습니다"
echo ""

echo "=== PATH 확인 ==="
echo $PATH
