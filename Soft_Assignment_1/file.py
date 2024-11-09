import random

# Parameters
POPULATION_SIZE = 100
MAX_GENERATIONS = 100
MUTATION_RATE = 0.01
CROSSOVER_RATE = 0.7
ELITISM = True

def initialize_population(num_tasks):
    return [[random.randint(0, 1) for _ in range(num_tasks)] for _ in range(POPULATION_SIZE)]

def fitness(chromosome, task_times, max_time_limit):
    core1_time = sum(task_times[i] for i in range(len(task_times)) if chromosome[i] == 1)
    core2_time = sum(task_times[i] for i in range(len(task_times)) if chromosome[i] == 0)
    max_time = max(core1_time, core2_time)

    if core1_time > max_time_limit or core2_time > max_time_limit:
        return float('inf')
    return max_time

# Roulette wheel selection
def selection(population, task_times, max_time_limit):
    fitness_scores = [1 / fitness(chromosome, task_times, max_time_limit) for chromosome in population]
    total_fitness = sum(fitness_scores)
    probabilities = [score / total_fitness for score in fitness_scores]
    return population[random.choices(range(POPULATION_SIZE), probabilities)[0]]
   
# One-point crossover
def crossover(parent1, parent2, num_tasks):
    if random.random() < CROSSOVER_RATE:
        crossover_point = random.randint(1, num_tasks - 1)
        return parent1[:crossover_point] + parent2[crossover_point:]
    else:
        return parent1 if random.random() < 0.5 else parent2

# Flip bit mutation
def mutate(chromosome):
    for i in range(len(chromosome)):
        if random.random() < MUTATION_RATE:
            chromosome[i] = 1 - chromosome[i]  # Flip bit
    return chromosome

# get the best chromosome based on fitness
def get_best_chromosome(population, task_times, max_time_limit):
    best_chromosome = population[0]
    best_fitness = fitness(best_chromosome, task_times, max_time_limit)

    for chromosome in population:
        current_fitness = fitness(chromosome, task_times, max_time_limit)
        if current_fitness < best_fitness:
            best_chromosome = chromosome
            best_fitness = current_fitness

    return best_chromosome

def evolve(population, task_times, max_time_limit, num_tasks):
    # Start the new generation with the best chromosome if elitism is enabled
    new_population = [get_best_chromosome(population, task_times, max_time_limit)] if ELITISM else []

    # Fill the rest of the population
    while len(new_population) < POPULATION_SIZE:
        parent1 = selection(population, task_times, max_time_limit)
        parent2 = selection(population, task_times, max_time_limit)
        offspring = mutate(crossover(parent1, parent2, num_tasks))
        new_population.append(offspring)

    return new_population

# Main GA function to find the best solution
def genetic_algorithm(task_times, max_time_limit):
    num_tasks = len(task_times)
    population = initialize_population(num_tasks)
    best_solution = get_best_chromosome(population, task_times, max_time_limit)

    for _ in range(MAX_GENERATIONS):
        population = evolve(population, task_times, max_time_limit, num_tasks)
        current_best = get_best_chromosome(population, task_times, max_time_limit)

        # Update the best solution if the current best is better
        if fitness(current_best, task_times, max_time_limit) > fitness(best_solution, task_times, max_time_limit):
            best_solution = current_best

    # Prepare task details for each core
    core1_tasks = [time for i, time in enumerate(task_times) if best_solution[i] == 1]
    core2_tasks = [time for i, time in enumerate(task_times) if best_solution[i] == 0]

    return {
        "best_solution": best_solution,
        "evaluation_score": max(sum(core1_tasks), sum(core2_tasks)),
        "core1_tasks": core1_tasks,
        "core2_tasks": core2_tasks,
        "core1_time": sum(core1_tasks),
        "core2_time": sum(core2_tasks)
    }

# Run the algorithm with hardcoded input for testing in Colab
def main():
    # Example hardcoded input to simulate the content of an input file
    input_data = [
        {"max_time_limit": 100, "task_times": [10, 20, 30, 40, 50]},
        {"max_time_limit": 150, "task_times": [60, 70, 80, 90]},
        {"max_time_limit": 200, "task_times": [20, 30, 40]}
    ]

    results = []
    for case_index, test_case in enumerate(input_data, start=1):
        max_time_limit = test_case["max_time_limit"]
        task_times = test_case["task_times"]

        result = genetic_algorithm(task_times, max_time_limit)
        results.append({
            "test_case": case_index,
            "best_solution": result["best_solution"],
            "evaluation_score": result["evaluation_score"],
            "core1_tasks": result["core1_tasks"],
            "core1_time": result["core1_time"],
            "core2_tasks": result["core2_tasks"],
            "core2_time": result["core2_time"]
        })

    # Display results
    for result in results:
        print(f"Test Case {result['test_case']}")
        print(f"Best Solution: {result['best_solution']}")
        print(f"Evaluation Score: {result['evaluation_score']}")
        print(f"Core 1 Tasks: {result['core1_tasks']}, Total Time: {result['core1_time']}")
        print(f"Core 2 Tasks: {result['core2_tasks']}, Total Time: {result['core2_time']}")
        print()

main()