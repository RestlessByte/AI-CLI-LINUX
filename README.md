### 🐧 SUPPORTS: ALL DESTRIBUTIONS USAGE BASH AND PACKAGE MANAGER
## Requirement:
- **Package Manager NPM**
- **Package Manager BUN**
- **Ethernet**
- **Open AI API hub - [https://github.com/RestlessByte/usingOpenAI]**
# 🧠 OpenAI API Interaction Program
This program allows you to interact with the OpenAI API directly from the Linux terminal.
## 👨🏽‍🔬 How to use?
1. Install dependencies:
```bash
#!/bin/bash

path=$(pwd)
git clone git@github.com:RestlessByte/AI-CLI.git
cd AI-CLI
git clone git@github.com:RestlessByte/usingOpenAI.git
bun install
mv $pwd.env.example .env
code .env
cd '$path'
```
2. 🧸 Before starting, add your token to the `.env` file under Environment Variables for the desired neural network.
3. ✨ Run the program:
```bash
bun index.ts
```
# HOW USING AI TERMINAL WITH OTHER PATH? **BASH SCRIPT**
```bash
#!/bin/bash
cat >> ~/.bashrc << 'EOF'
function aiterminal(){
  path=$(pwd)
  cd ~/AI-CLI/ || return
  bun index.ts
  cd "$path" || return
}
EOF
```
## 👥 For Whom?
This script is intended for:
- **🐧 Novice LINUXOID**
- **👨🏽‍💻 Developers**
- **🔧 DevOPS**
- **✨ AICoders**
- **👨🏾‍🔬 Scientist || Analytics**
- **👨‍🔧 SysAdmin**
- **🔐 CyberSecurity**
## 🌟 Features
- **AI Powered from LINUX TERMINAL!**
- **Has memory of the result of a certain command**
- **Beautifully designed and formatted**
