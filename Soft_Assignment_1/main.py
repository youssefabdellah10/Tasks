import random

MUTATION_RATE = 0.01

def read_file(filename):
    with open(filename, 'r') as file:
        lines = file.readlines()
    num_test_cases = int(lines[0].strip())
    test_cases = []
    index = 1
    for _ in range(num_test_cases):
        max_time = int(lines[index].strip())
        num_tasks = int(lines[index + 1].strip())
        tasks = list(map(int, lines[index + 2:index + 2 + num_tasks]))
        test_cases.append([max_time, tasks])
        index += 2 + num_tasks
    return test_cases


def init_population(tasks, population_size):
    population = []
    for _ in range(population_size):
        individual = [random.choice([0, 1]) for _ in tasks]
        population.append(individual)
    return population
    
    
def crossover(parent1,parent2 ):
    if len(parent1) > 1:
        point = random.randint(1, len(parent1) - 1)
        child1 = parent2[point:] + parent1[:point]
        child2 = parent1[point:] + parent2[:point]
    else:
        child1 = parent1
        child2 = parent2
    return child1, child2
   
   
def Mutation(chromosome):
    return [(gene if random.random() > MUTATION_RATE else 1 - gene) for gene in chromosome]


def fitness(chromosome, test_case):
    core1_time =0
    core2_time =0
    tasks_time = test_case[1]
    for i in range(len(chromosome)):
        if chromosome[i] == 1:
            core1_time += tasks_time[i]
        else:
            core2_time += tasks_time[i]
    return max(core1_time,core2_time)


def Roulette_Wheel_Selection(population, fitnesses):
    total_fitness = sum(1 / (f + 1) for f in fitnesses)
    pick = random.uniform(0, total_fitness)
    current = 0
    for i, fitness in enumerate(fitnesses):
        current += 1 / (fitness + 1)
        if current > pick:
            return population[i]
    return population[-1] 



def elitism(population, fitnesses):
    best_idx = fitnesses.index(min(fitnesses))
    return population[best_idx]


def genetic_algorithm(test_case, population_size):
    tasks = test_case 
    population = init_population(tasks[1], population_size)
    for generation in range(50):
        fitnesses = []
        for individual in population:
            fit_value = fitness(individual, test_case)
            if fit_value > test_case[0]:
                pass
            else:
                fitnesses.append(fit_value)
        if not fitnesses:
            continue
        new_population = [elitism(population, fitnesses)]
        while len(new_population) < len(population):
            parent1 = Roulette_Wheel_Selection(population, fitnesses)
            parent2 = Roulette_Wheel_Selection(population, fitnesses)
            child1, child2 = crossover(parent1, parent2)
            new_population.append(Mutation(child1))
            if len(new_population) < len(population):
                new_population.append(Mutation(child2))
        population = new_population
        print("Generation " + str(generation) + ": " + str(child1) + ", " + str(child2) + " fitness= " + str(fitnesses))
    if not fitnesses:
        return None
    best_individual = elitism(population, fitnesses)
    return best_individual




if __name__ == '__main__':
    input_file = 'input.txt'
    test_cases = read_file(input_file)
    population_size = 50
    for i in range (3):
        result = genetic_algorithm(test_cases[i], population_size)
        print(result)
        population_size += 100
        print(test_cases[i])
    print('done')


