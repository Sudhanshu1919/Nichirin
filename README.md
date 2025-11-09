# 🧠 Nichirin — AI Voice Bot Web Application

Nichirin is an interactive **AI-powered voice chatbot** that combines **speech recognition**, **text-to-speech**, and **LLM (Gemini/ChatGPT)** integration into a seamless web experience. It enables natural, real-time conversations between users and an AI model — with both **voice input** and **voice output**.

---

## 🚀 Features

- 🎤 **Speech Recognition** — converts microphone input to text  
- 🧩 **Conversational AI** — powered by Gemini (via API key)  
- 🔊 **Text-to-Speech (TTS)** — responds using synthesized voice  
- 💬 **Chat Interface** — modern, responsive UI built with HTML, CSS and JavaScript  
- ⚙️ **Backend (Flask)** — routes user messages and communicates with the AI API  
- 🐳 **Docker Support** — easily containerized and deployable on AWS or any cloud  
- ☁️ **AWS Ready** — tested for EC2 deployment; works with Amplify / S3 + CloudFront patterns  
- 🔒 **Secrets via `.env` / Env Vars** — secure keys using python-dotenv, environment variables, or AWS SSM

---

## 🧰 Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Frontend   | HTML, CSS, JavaScript            |
| Backend    | Python (Flask)                   |
| AI         | Gemini / ChatGPT via API         |
| Speech     | Web Speech API (Recognition) & TTS tools |
| Deployment | AWS EC2 / Docker / Nginx / Gunicorn |
| Env mgmt   | python-dotenv, OS env vars, AWS SSM |

------

## 📂 Project Structure

Nichirin/
├── app.py                  # Flask backend server (entrypoint)
├── requirements.txt        # Python dependencies
├── static/
│   ├── css/
│   ├── js/
│   └── assets/
├── templates/
│   └── index.html
├── .env                    # Environment variables (NOT committed)
└── venv/                   # Python virtualenv (local)



---

## 🔑 Environment Variables

Create a `.env` file in the project root (do **not** commit it):

env-
GEMINI_API_KEY=your-gemini-api-key-here


Or export in the shell:

bash
echo 'export GEMINI_API_KEY="your-gemini-api-key-here"' >> ~/.bashrc
source ~/.bashrc


> ⚠️ Add `.env` to `.gitignore`:
>
> 
> .env
>

---

## 🖥️ Local Development (copy-paste commands)

bash
# Clone
git clone https://github.com/<your-username>/Nichirin.git
cd Nichirin

# Install system deps (Amazon Linux)
sudo yum update -y
sudo yum install -y python3 python3-pip

# Create virtualenv and activate
python3 -m venv venv
source venv/bin/activate

# Install Python deps
pip install --upgrade pip
pip install -r requirements.txt

# Create .env (replace with your real key)
cat > .env <<'EOF'
GEMINI_API_KEY=your-gemini-api-key-here
EOF

# Run dev server (bind to all interfaces for external testing)
python app.py
# or, if your app uses Flask CLI:
# FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000


Visit: `http://127.0.0.1:5000` (or from another machine use EC2 public IP and open the port in the security group)

---

## ☁️ Quick AWS EC2 Deploy (copy-paste commands)

bash
# On your local machine: SSH into EC2 (replace key & ip)
ssh -i path/to/your-key.pem ec2-user@<EC2_PUBLIC_IP>

# On EC2
sudo yum update -y
sudo yum install -y git python3 python3-pip

# Clone repo and prepare env
git clone https://github.com/<your-username>/Nichirin.git
cd Nichirin
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env (on EC2)
cat > .env <<'EOF'
GEMINI_API_KEY=your-gemini-api-key-here
EOF

# Run with gunicorn (recommended)
pip install gunicorn
gunicorn --bind 0.0.0.0:8000 app:app

# Make sure EC2 Security Group allows port 8000 inbound from your IP


Open: `http://<EC2_PUBLIC_IP>:8000`

---

## 🐳 Docker (Optional, copy-paste)

bash
# Build
docker build -t nichirin-app .

# Run with env var (do NOT hardcode key in image)
docker run -d -p 8080:8080 -e GEMINI_API_KEY="your-gemini-api-key-here" nichirin-app

# Or use a local .env file with docker-compose:
# docker run --env-file .env -d -p 8080:8080 nichirin-app


---

## 🔧 Common Troubleshooting

* **`GEMINI_API_KEY not set`**
  Ensure `.env` exists and `python-dotenv` is installed in the venv, then call `load_dotenv()` at the top of `app.py`:

python
  from dotenv import load_dotenv
  load_dotenv()

* **`ERR_CONNECTION_REFUSED`**

  * Use the EC2 public IP (not `127.0.0.1`) in the browser.
  * Ensure the app binds to `0.0.0.0` (not `127.0.0.1`).
  * Open the port in EC2 Security Group inbound rules.
* **App runs but not accessible externally**
  Confirm `ss -tulpn` or `netstat -tulpn` shows the app listening on `0.0.0.0:<port>`.
* **ModuleNotFoundError: dotenv**
  `pip install python-dotenv` inside the activated venv.

---

## 🛡️ Security Best Practices

* Never commit `.env` or secrets to Git.
* Use AWS SSM Parameter Store or Secrets Manager for production secrets.
* Create an IAM user with least privilege for any AWS operations.
* Limit Security Group inbound rules to your IP while testing.

---

## 📜 License

MIT License © 2025 — Nichirin Voice Bot

---

## 👨‍💻 Author

**Sudhanshu Jha** — Automation Tester & Developer @ TCS
Contact / Repo: [https://github.com/](https://github.com/)Sudhanshu1919

