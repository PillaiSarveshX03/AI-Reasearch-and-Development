from sklearn.tree import DecisionTreeClassifier
import joblib

print("Loading data...")

marks = [
    [95], [88], [75], [68],
    [55], [42], [30], [20], [10]
]

results = [
    "Pass", "Pass", "Pass", "Pass",
    "Pass", "Pass", "Fail", "Fail", "Fail"
]

model = DecisionTreeClassifier()

print("Training...")

model.fit(marks, results)

print("Saving...")

joblib.dump(model, "model.pkl")

print("Done!")