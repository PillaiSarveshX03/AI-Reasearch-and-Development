import sqlite3

DB_NAME = "database/chatbot.db"


# -------------------- Connection --------------------

def connect():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# -------------------- Create Database --------------------

def create_database():
    conn = connect()
    cursor = conn.cursor()

    with open("database/schema.sql", "r") as file:
        cursor.executescript(file.read())

    conn.commit()
    conn.close()


# -------------------- Resources --------------------

def add_resource(id, title, level, content, sources):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO resources
        (id, title, level, content, sources)
        VALUES (?, ?, ?, ?, ?)
        """,
        (id, title, level, content, sources)
    )

    conn.commit()
    conn.close()


def get_resources():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM resources")
    data = cursor.fetchall()

    conn.close()
    return data


# -------------------- Chat History --------------------

def save_chat(id, user_query, chatbot_response, created_at):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO chat_history
        (id, user_query, chatbot_response, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (id, user_query, chatbot_response, created_at)
    )

    conn.commit()
    conn.close()


def get_chat_history():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM chat_history ORDER BY created_at DESC")
    data = cursor.fetchall()

    conn.close()
    return data


# -------------------- Feedback --------------------

def save_feedback(id, rating, comments, created_at):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO feedback
        (id, rating, comments, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (id, rating, comments, created_at)
    )

    conn.commit()
    conn.close()


def get_feedback():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM feedback")
    data = cursor.fetchall()

    conn.close()
    return data


# -------------------- Main --------------------

if __name__ == "__main__":
    create_database()
    print("✅ Database and tables created successfully.")