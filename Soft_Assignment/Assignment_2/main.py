import random
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
    
def checkprop(chromosome,upper):
    total_prop = 0
    for gene in chromosome:
        total_prop += gene
    if (total_prop==upper):
        return True
    else:
        return False
    
def calculate_cost(chromosome,costs):
   total_cost =0
   for gene,cost in chromosome,costs:
       total_cost += gene * cost
   return total_cost

def tournament_selection(chromosome1,chromosome2,costs):
    cost1 = calculate_cost(chromosome1,costs)
    cost2 = calculate_cost(chromosome2,costs)
    min_cost = min(cost1,cost2)
    if(min_cost==cost1):
        return chromosome1
    else:
        return chromosome2

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
def nonuniform_mutaion(chromosome,lower,upper):
 gene_index = random.randint(0,len(chromosome)-1)
 y =1
 chromosome [gene_index] = 1
 return chromosome




if __name__ == '__main__':
    content = readFromFile('input.txt')
    print(content[0][1])