import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score
import numpy as np
import matplotlib.pyplot as plt
from sklearn.tree import plot_tree

weather_dataset_path = 'weather_forecast_data.csv'
weather_dataset=pd.read_csv(weather_dataset_path)

print("Initial Data Overview:")
print(weather_dataset.head())

weather_dataset_missing = weather_dataset.isnull().sum()
print("\nMissing Data in Each Feuture:")
print(weather_dataset_missing)

print(f"\nWeather Dataset shape before dropping missing values: {weather_dataset.shape}")

print(f"\nWeather Dataset shape after dropping rows with missing values: {weather_dataset.dropna().shape}):")

Mean_replaced_dataset = weather_dataset.copy()
for column in weather_dataset.select_dtypes(include=['float64', 'int64']).columns:
    value_mean = weather_dataset[column].mean()
    Mean_replaced_dataset[column] = Mean_replaced_dataset[column].fillna(value_mean)

print("\nDataset after replacing missing values with the mean:")
print(Mean_replaced_dataset.shape) 
print("\nMissing values count after replacement:")
print(Mean_replaced_dataset.isnull().sum())

print("\nSummary statistics before scaling:")
print(Mean_replaced_dataset.describe())

Feutures = Mean_replaced_dataset.drop(columns=['Rain']) 
Target = Mean_replaced_dataset['Rain'] 

train_feutures, test_feutures, train_target, test_target = train_test_split(Feutures, Target, test_size=0.25, random_state=33)

print(f"\nTraining data shape: {train_feutures.shape}")
print(f"Testing data shape: {test_feutures.shape}")

# Scale the features
scaler = StandardScaler()

# Fit the scaler on the training data and transform both training and test sets
feuture_train_scaled = pd.DataFrame(scaler.fit_transform(train_feutures), columns=train_feutures.columns)
feuture_test_scaled = pd.DataFrame(scaler.transform(test_feutures), columns=test_feutures.columns)

print("\nScaled Training Features:")
print(feuture_train_scaled.head())

print("\nScaled Testing Features:")
print(feuture_test_scaled.head())

label_encoder = LabelEncoder()
Target_train_encoded = label_encoder.fit_transform(train_target)
Target_test_encoded = label_encoder.transform(test_target)


classifier_of_DecisionTree = DecisionTreeClassifier( criterion= 'gini',max_depth=4 , random_state=33)
classifier_of_DecisionTree.fit(train_feutures, Target_train_encoded)  
y_pred_dt = classifier_of_DecisionTree.predict(test_feutures)

def knn(k):
 classifier_of_Knn = KNeighborsClassifier(n_neighbors=3)
 classifier_of_Knn.fit(train_feutures, Target_train_encoded)  
 y_pred_knn = classifier_of_Knn.predict(test_feutures)
 accuracy_of_Knn, precision_of_Knn,recall_of_Knn = evaluate_model(Target_test_encoded, y_pred_knn)
 return accuracy_of_Knn, precision_of_Knn,recall_of_Knn

classifier_of_NaïveBayes = GaussianNB()
classifier_of_NaïveBayes.fit(train_feutures, Target_train_encoded) 
y_pred_nb = classifier_of_NaïveBayes.predict(test_feutures)

def evaluate_model(y_true, y_pred):
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average='weighted', zero_division=1)
    recall = recall_score(y_true, y_pred, average='weighted', zero_division=1)
    return accuracy, precision, recall


accuracy_of_DecisionTree, precision_of_DecisionTree, recall_of_DecisionTree = evaluate_model(Target_test_encoded, y_pred_dt)




accuracy_of_NaïveBayes, precision_of_NaïveBayes, recall_of_NaïveBayes = evaluate_model(Target_test_encoded, y_pred_nb)

accuracy_of_Knn, precision_of_Knn,recall_of_Knn = knn(3)
print(f"\nDecision Tree Classifier - Accuracy: {round(accuracy_of_DecisionTree,3)}, Precision: {round(precision_of_DecisionTree,3)}, Recall: {round(recall_of_DecisionTree,3)}")
print(f"kNN Classifier - Accuracy: {round(accuracy_of_Knn,3)}, Precision: {round(precision_of_Knn,3)}, Recall: {round(recall_of_Knn,3)}")
print(f"Naïve Bayes Classifier - Accuracy: {round(accuracy_of_NaïveBayes,3)}, Precision: {round(precision_of_NaïveBayes,3)}, Recall: {round(recall_of_NaïveBayes,3)}")

metrics = ['Accuracy', 'Precision', 'Recall']
decision_tree_metrics = [accuracy_of_DecisionTree, precision_of_DecisionTree, recall_of_DecisionTree]
knn_metrics = [accuracy_of_Knn, precision_of_Knn, recall_of_Knn]
naive_bayes_metrics = [accuracy_of_NaïveBayes, precision_of_NaïveBayes, recall_of_NaïveBayes]

# Group data by models
data = [decision_tree_metrics, knn_metrics, naive_bayes_metrics]

# Plot
x = range(len(metrics))  # Indices for metrics
plt.figure(figsize=(8, 6))

plt.bar(x, decision_tree_metrics, width=0.2, label='Decision Tree', align='center')
plt.bar([i + 0.2 for i in x], knn_metrics, width=0.2, label='kNN', align='center')
plt.bar([i + 0.4 for i in x], naive_bayes_metrics, width=0.2, label='Naïve Bayes', align='center')

# Add labels, title, and legend
plt.xticks([i + 0.2 for i in x], metrics)
plt.ylabel('Scores')
plt.title('Performance Comparison')
plt.legend()

plt.tight_layout()
plt.show()

# 4. kNN from Scratch
def knn_from_scratch(X_train, X_test, k=3):
    predictions = []
    
    for test_point in X_test.values:
        distances = np.linalg.norm(X_train.values - test_point, axis=1)
        
    
        k_nearest_indices = distances.argsort()[:k]
        k_nearest_labels = Target_train_encoded[k_nearest_indices]  
        
        most_common = np.bincount(k_nearest_labels).argmax()
        
        predictions.append(most_common)
    
    return predictions


y_pred_knn_custom = knn_from_scratch(train_feutures, test_feutures, k=3)


y_pred_knn_custom_decoded = label_encoder.inverse_transform(y_pred_knn_custom)

knn_custom_accuracy, knn_custom_precision, knn_custom_recall = evaluate_model(test_target, y_pred_knn_custom_decoded)

#print(f"\nCustom kNN from Scratch - Accuracy: {round(knn_custom_accuracy,3)}, Precision: {round(knn_custom_precision,3)}, Recall: {round(knn_custom_recall,3)}")
print(f"\nComparison between custom kNN and scikit-learn kNN:")
#print(f"Scikit-learn kNN - Accuracy: {round(accuracy_of_Knn,3)}, Precision: {round(precision_of_Knn,3)}, Recall: {round(recall_of_Knn,3)}")
#print(f"Custom kNN - Accuracy: {round(knn_custom_accuracy,3)}, Precision: {round(knn_custom_precision,3)}, Recall: {round(knn_custom_recall,3)}")

plt.figure(figsize=(15,10))
plot_tree(classifier_of_DecisionTree, filled=True, feature_names=Feutures.columns, class_names=['No Rain', 'Rain'])
plt.show()

k_values = [1, 3, 5, 7, 9]
 # for custom KNN 
for k in k_values:
    y_pred_knn_custom = knn_from_scratch(train_feutures,test_feutures, k)

    y_pred_knn_custom_decoded = label_encoder.inverse_transform(y_pred_knn_custom)
    knn_custom_accuracy, knn_custom_precision, knn_custom_recall = evaluate_model(test_target, y_pred_knn_custom_decoded)
    round(knn_custom_precision,3)
    print(f"Custom kNN (k={k}) - Accuracy: {round(knn_custom_accuracy,3)}, Precision: {round(knn_custom_precision,3)}, Recall: {round(knn_custom_recall,3)}")

# for scikit-learn KNN 
print("=========================================================")
for k in k_values:
    accuracy_of_Knn, precision_of_Knn,recall_of_Knn = knn(k)
    print(f"scikit-learn kNN (k={k}) - Accuracy: {round(knn_custom_accuracy,3)}, Precision: {round(knn_custom_precision,3)}, Recall: {round(knn_custom_recall,3)}")
