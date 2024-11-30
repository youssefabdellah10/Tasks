import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import SGDClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn import tree

pd.set_option('display.max_columns', None)
dataset_path = 'weather_forecast_data.csv'
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

independent_features = dataset.drop(columns=['Rain'])
dependent_target_class = dataset['Rain']

encoder = LabelEncoder()
categorical_col = independent_features.select_dtypes(include=['object']).columns
for feature in categorical_col:
    independent_features[feature] = encoder.fit_transform(independent_features[feature])

dependent_target_class = encoder.fit_transform(dependent_target_class)

# Split train and test data
X_train, X_test, y_train, y_test = train_test_split(independent_features, dependent_target_class, test_size=0.3, random_state=44, shuffle=True)

# Decision Tree model
classifier = DecisionTreeClassifier( random_state=44, max_depth=4,  min_samples_leaf=4)

classifier.fit(X_train, y_train)
y_pred = classifier.predict(X_test) 

# Evaluate the model 
accuracy = accuracy_score(y_test, y_pred)
conf_matrix = confusion_matrix(y_test, y_pred)
class_report = classification_report(y_test, y_pred)
accuracy = round(accuracy,3) *100
print(f"Accuracy: {accuracy}%") 
print("Confusion Matrix:")
print(conf_matrix)
print("Classification Report:") 
print(class_report)

# Visualize the decision tree 
plt.figure(figsize=(15,10))
tree.plot_tree(classifier, filled=True, feature_names=independent_features.columns, class_names=encoder.classes_.astype(str))
plt.title("Decision Tree for Weather Forecast Dataset")
plt.show()
