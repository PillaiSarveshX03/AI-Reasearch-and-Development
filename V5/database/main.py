from database.db import Database

db = Database()

db.create_tables()


print("\nResources")
for row in db.get_resources():
    print(dict(row))

print("\nChat History")
for row in db.get_chat_history():
    print(dict(row))

print("\nFeedback")
for row in db.get_feedback():
    print(dict(row))



db.close()