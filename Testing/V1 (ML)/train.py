from sklearn.tree import DecisionTreeClassifier
import joblib

print("Loading data...")

# Features (marks)
X = [
    [95],
    [88],
    [75],
    [68],
    [55],
    [42],
    [30],
    [20],
    [10]
]

# Labels
y = [
    "Pass",
    "Pass",
    "Pass",
    "Pass",
    "Pass",
    "Pass",
    "Fail",
    "Fail",
    "Fail"
]

print("Creating model...")

model = DecisionTreeClassifier()

print("Training model...")

model.fit(X, y)

print("Saving model...")

joblib.dump(model, "model.pkl")

print("🎉 Training Complete!")