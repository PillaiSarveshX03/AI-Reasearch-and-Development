# 🧪 AI Testing Repository

This repository is a shared workspace for experimenting with different AI, Machine Learning, Backend, and API implementations. It serves as a testing ground where multiple versions and ideas can be developed independently without affecting existing work.

---

# 📋 Prerequisites

Before getting started, ensure you have the following installed:

- Python 3.11 or later
- Git
- Visual Studio Code (Recommended)

Verify your Python installation:

```bash
python --version
```

or

```bash
py --version
```

---

# 🚀 Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

---

# 🪟 Windows Setup (PowerShell)

## 1. Create a Virtual Environment

```powershell
py -m venv .venv
```

## 2. Activate the Virtual Environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If you receive an execution policy error, run:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate the virtual environment again:

```powershell
.\.venv\Scripts\Activate.ps1
```

You should now see:

```text
(.venv) PS C:\...\RepositoryName>
```

---

# 🐧 Linux / GitHub Codespaces Setup

## 1. Create a Virtual Environment

```bash
python3 -m venv .venv
```

## 2. Activate the Virtual Environment

```bash
source .venv/bin/activate
```

You should now see:

```bash
(.venv)
```

---

# 📦 Install Dependencies

After activating the virtual environment, install all required packages:

```bash
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

If the project requires API keys or configuration values, create a `.env` file in the project root and add the necessary variables.

Example:

```env
API_KEY=your_api_key
BASE_URL=your_api_url
MODEL=your_model_name
```

> Never commit your `.env` file to GitHub.

---

# ▶️ Running the Project

Depending on the project or version you're working on, run the appropriate command.

### FastAPI

```bash
python -m uvicorn app.main:app --reload
```

or

```bash
uvicorn app.main:app --reload
```

---

### Streamlit

```bash
streamlit run frontend/app.py
```

---

### Python Scripts

```bash
python filename.py
```

Example:

```bash
python groq_test.py
```

---

# 📄 Managing Dependencies

Whenever new packages are installed, update the requirements file:

```bash
pip freeze > requirements.txt
```

Other contributors can then install the exact same dependencies using:

```bash
pip install -r requirements.txt
```

---

# 🤝 Contributing

- Create new folders or versions for experimental work instead of modifying existing implementations.
- Keep commits clear and descriptive.
- Do not commit sensitive information such as API keys.
- Keep the `requirements.txt` file updated whenever dependencies change.

---

# 📜 License

This repository is intended for educational purposes, experimentation, and collaborative development.
