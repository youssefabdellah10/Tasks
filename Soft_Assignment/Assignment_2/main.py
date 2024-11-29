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
    
def checkprop(chromosome,upper):
    total_prop = 0
    for gene in chromosome:
        total_prop += gene
    if (total_prop==upper):
        return True
    else:
        return False
    
def fitness(chromosome, costs, boundary):
    weight = 0.0
    total_genes = 0
    diff = 0.0
    for gene, cost in zip(chromosome, costs):
        weight += gene * cost
        total_genes += gene
    penalty = 100 * abs(total_genes - boundary) 
    fitness = weight * penalty
    return fitness

def calculate_cost(chromosome, costs):
    total_cost = 0.0
    for gene, cost in zip(chromosome, costs):
        total_cost += gene * cost
    return total_cost


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

def nonuniform_mutation(chromosome, lower, upper, t, T):
    b=1.5
    gene_index = random.randint(0, len(chromosome) - 1)
    r1 = random.randint(0, 1)
    if r1 <= 0.5:
        delta = (chromosome[gene_index] - lower) * (1 - r1**((1-t/ T) ** b))
        chromosome[gene_index] -= delta
    else:
        delta = (upper - chromosome[gene_index]) * (1 - r1**((1-t/ T) ** b))
        chromosome[gene_index] += delta
    chromosome[gene_index] = round(chromosome[gene_index], 1)
    return chromosome

def elitism(population, fitnesses):
    best_idx = fitnesses.index(min(fitnesses))
    return population[best_idx]

def geneticAlgorithm(boundary,units,costs,populationSize,generation):
    new_population = []
    population = init_population(populationSize,units)
    fitnesses = []
    for i in range(generation):
        split_index = random.randint(1, populationSize - 1)
        parent1_subset = population[:split_index]
        parent2_subset = population[split_index:]
        if not parent1_subset or not parent2_subset:
            continue
        fitnesses = [fitness(chromosome, costs, boundary) for chromosome in population]
        parent1 = tournament_selection(parent1_subset, costs, boundary)
        parent2 = tournament_selection(parent2_subset, costs, boundary)
        child1, child2 = crossover(parent1, parent2)
        nonuniform_mutation(child1, 0, boundary, i, generation)
        nonuniform_mutation(child2, 0, boundary, i, generation)
        population.append(child1)
        population.append(child2)
        new_population.append(elitism(population, fitnesses))
        
    return new_population      
    
def sum_genes(chromosome):
    total = 0
    for gene in chromosome:
        total += gene
    return total

if __name__ == '__main__':
    content = readFromFile('input.txt')
    for i in range(len(content)):
        population = geneticAlgorithm(content[i][0][1],content[i][1],content[i][2],1000,200)
        max_value = 0.0
        best = []
        for i in range(20):
            current_value = sum_genes(population[i])
            if current_value > max_value:
                best = population[i]
                max_value = current_value
        print("Max value:", max_value, "Best chromosome:", best)
        


    
    