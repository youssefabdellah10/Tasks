import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def load_data(filePath):
    data = pd.read_excel(filePath)
    features = data.iloc[:, :-1].values
    targets = data.iloc[:, -1].values.reshape(-1, 1)
    return features, targets

scaler_features = StandardScaler()
scaler_targets = StandardScaler()

def preprocess_data(features, targets):

    X_train, X_test, y_train, y_test = train_test_split(features, targets, test_size=0.25, random_state=42)
    X_train = scaler_features.fit_transform(X_train)
    X_test = scaler_features.transform(X_test)
    y_train = scaler_targets.fit_transform(y_train)
    y_test = scaler_targets.transform(y_test)
    return X_train, X_test, y_train, y_test

class NeuralNetwork:
    def __init__(self):
        self.input_layer_size = None
        self.hidden_layer_size = None
        self.output_layer_size = None
        self.learning_rate = None
        self.epochs = None
        self.weights_input_to_hidden = None
        self.weights_hidden_to_output = None
        self.bias_hidden = None
        self.bias_output = None

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

    def sigmoid_derivative(self, x):
        return x * (1 - x)

    def set_network(self, input_layer_size, hidden_layer_size, output_layer_size, learning_rate, epochs):
        self.input_layer_size = input_layer_size
        self.hidden_layer_size = hidden_layer_size
        self.output_layer_size = output_layer_size
        self.learning_rate = learning_rate
        self.epochs = epochs

        self.weights_input_to_hidden = np.random.randn(self.input_layer_size, self.hidden_layer_size)
        self.weights_hidden_to_output = np.random.randn(self.hidden_layer_size, self.output_layer_size) 
        self.bias_hidden = np.zeros((1, self.hidden_layer_size))
        self.bias_output = np.zeros((1, self.output_layer_size))
        

    def train(self, X_train, y_train):
        for epoch in range(self.epochs):
            total_loss = 0
            for x,y in zip(X_train, y_train):
                # Forward propagation
                x = x.reshape(1, -1)
                y = y.reshape(1, -1)

                hidden_input = np.dot(x, self.weights_input_to_hidden) + self.bias_hidden
                hidden_output = self.sigmoid(hidden_input)

                y_pred = np.dot(hidden_output, self.weights_hidden_to_output) + self.bias_output 

                # Compute loss
                loss = np.mean((y - y_pred) ** 2)
                total_loss += loss

                # Backward propagation
                loss_output = y_pred - y
                d_weights_hidden_to_output = np.dot(hidden_output.T, loss_output)
                d_bias_output = loss_output

                d_hidden = np.dot(loss_output, self.weights_hidden_to_output.T) * self.sigmoid_derivative(hidden_output)
                d_weights_input_to_hidden = np.dot(x.T, d_hidden)
                d_bias_hidden = d_hidden

                # Update weights and biases
                self.weights_input_to_hidden -= self.learning_rate * d_weights_input_to_hidden
                self.weights_hidden_to_output -= self.learning_rate * d_weights_hidden_to_output
                self.bias_hidden -= self.learning_rate * d_bias_hidden
                self.bias_output -= self.learning_rate * d_bias_output
            if (epoch + 1) % 100 == 0:
                print(f"Epoch {epoch + 1}/{self.epochs}, Loss: {total_loss/len(X_train)}")

    def predict(self, X):
        hidden_input = np.dot(X, self.weights_input_to_hidden) + self.bias_hidden
        hidden_output = self.sigmoid(hidden_input)
        predict = np.dot(hidden_output, self.weights_hidden_to_output) + self.bias_output
        return predict

    def calculate_error(self, X_test, y_test):
        y_pred = self.predict(X_test)
        return np.mean((y_test - y_pred) ** 2)




if __name__ == '__main__':

    features, targets = load_data("concrete_data.xlsx")

    X_train, X_test, y_train, y_test = preprocess_data(features, targets)

    nn = NeuralNetwork()
    nn.set_network(input_layer_size=4, hidden_layer_size=4,output_layer_size=1, learning_rate=0.001, epochs=1000)

    nn.train(X_train, y_train)
    
    test_error = nn.calculate_error(X_test, y_test)
    print(f"Test Error: {test_error}")

    
    print("how many example:")
    num = int(input())
    for i in range(num):
        print("Enter the following features to predict the concrete compressive strength:")
        print("Enter Cement:")
        cement = int(input())
        print("Enter water:")
        water = int(input())
        print("Enter superplasticizer:")
        superplasticizer = float(input())
        print("Enter age:")
        age = int(input())
        examples = np.array([[cement, water, superplasticizer, age]])
        examples_scaled = scaler_features.transform(examples)
        predictions_scaled = nn.predict(examples_scaled)
        predictions = scaler_targets.inverse_transform(predictions_scaled)
        for i, prediction in enumerate(predictions):
            print(f"{i+1} Predicted concrete_compressive_strength: {prediction[0]} ")

    