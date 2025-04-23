import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.calibration import LabelEncoder
from sklearn.model_selection import train_test_split

pd.set_option('display.max_columns', None)
dataset_path = 'co2_emissions_data.csv'
dataset = pd.read_csv(dataset_path)

print("\n Missing values in each column:")
print(dataset.isnull().sum())

numeric_features = dataset.select_dtypes(include=['float64', 'int64']).columns
summary_info =dataset.describe().to_string()
print("\n Summary info of Dataset analysis:")
print(summary_info)


sns.pairplot(dataset[numeric_features])
plt.show()


Matrix_Correlation = dataset[numeric_features].corr()
plt.figure(figsize=(9, 7))
plt.title(" This is correlation heatmap of numeric features")
sns.heatmap(Matrix_Correlation, annot=True, fmt='.3f', linewidths=1, cmap='coolwarm')
plt.show()

independent_feutures= dataset.drop(columns=['CO2 Emissions(g/km)', 'Emission Class'])
dependent_target_continuous = dataset['CO2 Emissions(g/km)']
dependent_target_class = dataset['Emission Class'] 

encoder = LabelEncoder()
categorical_col= independent_feutures.select_dtypes(include=['object']).columns
for feature in categorical_col:
    independent_feutures[feature] = encoder.fit_transform(independent_feutures[feature])

dependent_target_class = encoder.fit_transform(dependent_target_class)

independent_features_train,independent_feutures_test,emission_train_values,emission_test_values,emission_train_classes,emission_test_classes = train_test_split(
    independent_feutures,dependent_target_continuous,dependent_target_class, test_size=0.3, random_state=123, shuffle=True)


mean = independent_features_train.mean(axis=0)
standard_deviation = independent_features_train.std(axis=0)
Scaled_numeric_train = (independent_features_train - mean) / standard_deviation
Scaled_numeric_test = (independent_feutures_test - mean) / standard_deviation

print("Scaled Training Features (First 5 rows):\n", Scaled_numeric_train.head())
print("Scaled Test Features (First 5 rows):\n", Scaled_numeric_test.head())