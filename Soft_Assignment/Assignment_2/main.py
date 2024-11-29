import random
import math
def readFromFile(filename):
    try:
        with open(filename,'r') as file:
            content = file.readlines()
        
        num_datasets = int(content[0].strip())            
        units=[]
        costs=[]
        percentage =[]
        dataset = []
        index =1
        for _ in range(num_datasets):
            percentage.extend([float(x) for x in content[index].strip().split(' ')])
            index +=1
            units.extend([float(x) for x in content[index].strip().split(' ')])
            index += 1
            costs.extend([float(x) for x in content[index].strip().split(' ')])
            index += 1
            dataset.append([percentage,units,costs])
            percentage =[]
            units=[]
            costs=[]
        
        return dataset
    except FileNotFoundError:
        return 'File not found'
    except Exception as e:
        return str(e)
    

        

def chromosomeRepresentation(units):
    chromosome = []
    i=0
    while i < len(units):
        individual = round(random.uniform(units[i],units[i+1]), 1)
        i += 2
        chromosome.append(individual)
    return chromosome

def init_population(pop_size,units):
    population = []
    for _ in range(pop_size):
        chromosome = chromosomeRepresentation(units)
        population.append(chromosome)
    return population
    
def fitness(chromosome, costs, boundary):
    weight = 0.0
    total_genes = 0.0
    penalty = 0.0
    for gene, cost in zip(chromosome, costs):
        weight += gene * cost
        total_genes += gene
    penalty = 100 * math.exp(abs(total_genes - boundary))
    fitness = weight + penalty
    return fitness

def calculate_cost(chromosome, costs):
    total_cost = 0.0
    for gene, cost in zip(chromosome, costs):
        total_cost += gene * cost
    return total_cost

def sum_genes(chromosome):
    total = 0
    for gene in chromosome:
        total += gene
    return total


def tournament_selection(subset,costs,boundary):
    while len(subset) > 1:
        i = random.randint(0, len(subset) - 2)
        cost1 = fitness(subset[i], costs, boundary)
        cost2 = fitness(subset[i + 1], costs,boundary)
        if cost1 <= cost2:
            subset.pop(i + 1)
        else:
            subset.pop(i)
    return subset[0]

def crossover(parent1, parent2):
    if len(parent1) > 2:
        point1 = random.randint(1, len(parent1) - 2)
        point2 = random.randint(point1 + 1, len(parent1) - 1)
        child1 = parent1[:point1] + parent2[point1:point2] + parent1[point2:]
        child2 = parent2[:point1] + parent1[point1:point2] + parent2[point2:]
    else:
        child1 = parent1
        child2 = parent2

    return child1, child2

def nonuniform_mutation(chromosome, lower, upper , t, T):
    b=3.5
    gene_index = random.randint(0, len(chromosome) - 1)
    r1 = random.random()
    if r1 <= 0.5:
        delta = (chromosome[gene_index] - lower) * (1 - r1**((1-t/ T) ** b))
        chromosome[gene_index] = delta
    else:
        delta = (upper - chromosome[gene_index]) * (1 - r1**((1-t/ T) ** b))
        chromosome[gene_index] = delta
    chromosome[gene_index] = round(chromosome[gene_index], 2)
    return chromosome

def elitism(fitnesses):
    best_idx = fitnesses.index(min(fitnesses))
    return best_idx

    
        
        

def geneticAlgorithm(boundary, units, costs, populationSize, generation):
    population = init_population(populationSize, units)
    for i in range(generation):
        new_population = []
        fitnesses = [fitness(chromosome, costs, boundary) for chromosome in population]
        new_population.append(population[elitism(fitnesses)])
        population.remove(population[elitism(fitnesses)])
        split_index = len(population) // 2
        parent1_subset = population[:split_index]
        parent2_subset = population[split_index:]
        parent1 = tournament_selection(parent1_subset, costs, boundary)
        parent2 = tournament_selection(parent2_subset, costs, boundary)
        child1, child2 = crossover(parent1, parent2)
        child1 = nonuniform_mutation(child1, child1[0],child1[len(child1)-1], i, generation)
        child2 = nonuniform_mutation(child2, child2[0],child2[len(child2)-1], i, generation)
        new_population.append(child1)
        new_population.append(child2)
        while len(new_population) < len(population):
            x = random.choice(population)
            new_population.append(x)
            population.remove(x)
        population = new_population[:]
        
    return population

def writeToFile(filename, index, units,total_cost):
    with open(filename, 'a') as file:
        file.write(f"Dataset: {index+1}\n")
        file.write(f"Chemical Proportions: {units}\n")  
        file.write(f"Total Cost: {total_cost}\n") 
        
def getTheOptimal(population,cost,generation):
    best_max = 0.0
    best = []
    for i in range(len(population)):
        current_value = sum_genes(population[i])
        if current_value > best_max:
            best = population[i]
            best_max = current_value
    cost_ = calculate_cost(best,cost)
    return best,cost_
    
if __name__ == '__main__':
    content = readFromFile('input.txt')
    optimal = []
    best_costs = 0.0
    generation = 100
    sum = 0.0
    for i in range(len(content)):
        population = geneticAlgorithm(content[i][0][1],content[i][1],content[i][2],1000,generation)
        best, best_cost = getTheOptimal(population,content[i][2],generation)
        writeToFile('output.txt',i,best,best_cost)
        for _ in range(len(best)):
            sum += best[_]
        print(f"Dataset: {i+1}")
        print(f"Chemical Proportions: {best}")  
        print(f"Total Cost: {best_cost}") 
        print( "Total Proportion", sum)
        if(sum == content[i][0][1]):
            print("feasible solution")
        else:
            print("infeasible solution")
        
        best_cost = 0.0
        best = []
        sum= 0  
        
        


    
    