import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import  accuracy_score, confusion_matrix
from sklearn.metrics import r2_score

pd.set_option('display.max_columns', None)
dataset_path = 'co2_emissions_data.csv'
dataset = pd.read_csv(dataset_path)

print("\nMissing values in each column:")
print(dataset.isnull().sum())

numeric_features = dataset.select_dtypes(include=['float64', 'int64']).columns
summary_info = dataset.describe().to_string()
print("\nSummary info of Dataset analysis:")
print(summary_info)

sns.pairplot(dataset[numeric_features])
plt.show()

Matrix_Correlation = dataset[numeric_features].corr()
plt.figure(figsize=(9, 7))
plt.title("This is correlation heatmap of numeric features")
sns.heatmap(Matrix_Correlation, annot=True, fmt='.3f', linewidths=1, cmap='coolwarm')
plt.show()

independent_features = dataset.drop(columns=['CO2 Emissions(g/km)', 'Emission Class'])
dependent_target_continuous = dataset['CO2 Emissions(g/km)']
dependent_target_class = dataset['Emission Class']

encoder = LabelEncoder()
categorical_col = independent_features.select_dtypes(include=['object']).columns
for feature in categorical_col:
    independent_features[feature] = encoder.fit_transform(independent_features[feature])

dependent_target_class = encoder.fit_transform(dependent_target_class)

selected_features = independent_features[['Engine Size(L)', 'Fuel Consumption City (L/100 km)']]


independent_features_train, independent_features_test, emission_train_values, emission_test_values, emission_train_classes, emission_test_classes = train_test_split(
    selected_features, dependent_target_continuous, dependent_target_class, test_size=0.3, random_state=123,
    shuffle=True)

mean = independent_features_train.mean(axis=0)
standard_deviation = independent_features_train.std(axis=0)
Scaled_numeric_train = (independent_features_train - mean) / standard_deviation
Scaled_numeric_test = (independent_features_test - mean) / standard_deviation


print("Scaled Training Features (First 5 rows):\n", Scaled_numeric_train.head())
print("Scaled Test Features (First 5 rows):\n", Scaled_numeric_test.head())

# Gradient Descent for linear regression
iterations = 1000
learning_rate = 0.0001
m = len(emission_train_values)
theta = np.zeros(independent_features_train.shape[1] + 1)

X_train = np.c_[np.ones((independent_features_train.shape[0], 1)), independent_features_train]
X_test = np.c_[np.ones((independent_features_test.shape[0], 1)), independent_features_test]

costs =[]
for iteration in range(iterations):
# Hypothesis function
 predictions = X_train.dot(theta)
# Calculate the error of the hypothesis
 errors = predictions - emission_train_values
# Gradient Descent updates
 gradient = (1 / m) * X_train.T.dot(errors)
 theta -= learning_rate * gradient
# Calculate the cost
 cost = (1 / (2 * m)) * np.sum(errors ** 2)
 costs.append(cost)

# Plotting the cost function
plt.figure(figsize=(8, 6))
plt.plot(range(iterations), costs, color='blue')
plt.title('Cost Function Over Iterations')
plt.xlabel('Iteration')
plt.ylabel('Cost')
plt.grid(True)
plt.show()


# Final theta value
print("\nFinal parameter values (theta):")
print(theta)

# Making predictions on the test set
predictions_test = X_test.dot(theta)
print("\nFirst 6 predictions on the test set:")
print(predictions_test[:6])


# test set using Scikit-learn’s R2 score
r2 = r2_score(emission_test_values, predictions_test)
r2 = round(r2,5)
print(f"\nR2 score on the test set: {r2}")

# Plot actual vs predicted values
plt.figure(figsize=(8, 6))
plt.scatter(emission_test_values, predictions_test, color='blue', alpha=0.6, label="Predicted vs Actual")
plt.plot([emission_test_values.min(), emission_test_values.max()],
         [emission_test_values.min(), emission_test_values.max()],
         color='red', linestyle='--', label="Ideal Fit")
plt.title("Actual vs Predicted CO2 Emissions")
plt.xlabel("Actual CO2 Emissions")
plt.ylabel("Predicted CO2 Emissions")
plt.legend()
plt.grid(True)
plt.show()

sgd_classifier = SGDClassifier()
sgd_classifier.fit(independent_features_train, emission_train_classes)

emission_test_classes_pred = sgd_classifier.predict(independent_features_test)

accuracy = accuracy_score(emission_test_classes, emission_test_classes_pred)
print("Accuracy:", accuracy)

# Confusion matrix
conf_matrix = confusion_matrix(emission_test_classes, emission_test_classes_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=encoder.classes_, yticklabels=encoder.classes_)
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.show()