### 🐧 SUPPORTS: ALL DESTRIBUTIONS USAGE BASH
# 🧠 OpenAI API Interaction Program

This program allows you to interact with the OpenAI API directly from the Linux terminal.

## 👨🏽‍🔬 How to use?
1. Install dependencies: 
```bash
git clone git@github.com:RestlessByte/AutomatonTerminalForLINUX.git && bun install
cat <<EOF >> ~/.bashrc
aiterminal() {
    path="$(pwd)"
    bash "/home/$USER/appImageOpenForLinux/appimage-launcher.sh"
    cd "$path"
}
EOF
source ~/.bashrc
mv $pwd.env.example .env
```
2. 🧸 Before starting, add your token to the `.env` file under Environment Variables for the desired neural network.
3. ✨ Run the program: 
```bash
bun index.ts
```
